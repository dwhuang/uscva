#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Self-organizing map training script
"""
import sys
sys.path.append("../")

import pickle
from os.path import exists
import json
import numpy as np
import csv

from som.som import Som
from som.hexgrid import HexGrid
from som.utils import read_data
from som.utils import gen_random_data
from som.utils import parameter_sweep
from som.utils import filter_inputs_by_nan_ratio
from file_walker import FileWalker


def display_som(som, labels, inputs, show_umatrix=False):
    print(som.smoothness())
    print(som.error(inputs))

    if show_umatrix:
        # U-matrix visualization
        umatrix = som.umatrix()
        som.grid.draw(
            [[m, m, m] for m in umatrix],
            text=som.label(labels, inputs),
            scale=10,
        )


def main():
    if len(sys.argv) <= 2:
        print("Usage: {} config train|load|parameter_sweep".format(sys.argv[0]))
        sys.exit()

    with open(sys.argv[1], 'r') as fp:
        config = json.load(fp)
    command = sys.argv[2]

    data_fname = '{}/{}-features.tsv'.format(
        config['output_path'],
        config['name'],
    )
    labels, inputs = read_data(data_fname)

    som = Som(
        grid=HexGrid(config['som_model_size']),
        input_dim=inputs.shape[1],
        nb_init=0.9,
        nb_infl=0.4,
        nb_sigma=0.01,
        lr_init=0.4,
        lr_infl=0.6,
        lr_sigma=0.0001,
        input_ranges=[
            np.nanmin(inputs, axis=0),
            np.nanmax(inputs, axis=0),
        ],
    )
    print("model size:", som.grid.radius)

    som_fname = '{}/{}-model.som'.format(
        config['output_path'],
        config['name'],
    )
    if command == 'train':
        training_inputs = filter_inputs_by_nan_ratio(
            inputs,
            config['training_data_nan_threshold'],
        )
        som.train(training_inputs, 1000)
        display_som(som, labels, inputs)
        # save SOM to a file
        with open(som_fname, 'wb') as fp:
            pickle.dump(som, fp, protocol=-1)
    elif command == 'load':
        # load SOM from a file
        with open(som_fname, 'rb') as fp:
            som = pickle.load(fp)
        display_som(som, labels, inputs, show_umatrix=True)
    elif command == 'parameter_sweep':
        parameter_sweep(10,
            data_fname,
            '{}/{}-parameter_sweep.csv'.format(
                config['output_path'],
                config['name'],
            ),
            [0.9, 0.75, 0.6],
            [0.4, 0.5, 0.6],
            [0.01, 0.001, 0.0001],
            [0.4, 0.3, 0.2],
            [0.4, 0.5, 0.6],
            [0.01, 0.001, 0.0001],
            input_ranges=[
                [-1] * inputs.shape[1],
                [1] * inputs.shape[1],
            ],
        )
    elif command == 'export':
        # Export labeled map for visualization purposes
        # load SOM from a file
        with open(som_fname, 'rb') as fp:
            som = pickle.load(fp)
        # relevant data
        umatrix = som.umatrix()
        labeled_map = som.label(labels, inputs)
        features = dict(zip(labels, inputs))
        profiles = CongressMemberProfile(config)
        # export for each node
        results = []
        for i, (centroid, _) in enumerate(
            som.grid.shape_coords(config['export_shape_scale']),
        ):
            results.append(
                {
                    'centroid': centroid,
                    'umatrix_value': umatrix[i],
                    'labels': [
                        {
                            'id': id,
                            'features': [
                                '' if np.isnan(f) else int(f)
                                for f in features[id]
                            ],
                            'profile': profiles.get_profile(id),
                        }
                        for id in labeled_map[i]
                    ],
                    'weights': som.weights[i, :].round(6).tolist(),
                }
            )
        with open(
            "{}/{}-export.json".format(
                config['output_path'],
                config['name'],
            ),
            'w'
        ) as fp:
            json.dump(results, fp, indent=2)
    else:
        print("Unknown command {}".format(command))
        sys.exit()


class CongressMemberProfile:
    def __init__(self, config):
        self.govtrack_id_to_profile = {}
        self.other_id_to_govtrack_id = {}
        for fpath in FileWalker.walk(
            config['input_path'],
            config['congress_member_data_path_patterns'],
        ):
            with open(fpath, 'r') as fp:
                reader = csv.DictReader(fp)
                for row in reader:
                    self.__add_profile_helper(row)


    def get_profile(self, query_id):
        if query_id in self.govtrack_id_to_profile:
            return self.govtrack_id_to_profile[query_id]
        for id_map in self.other_id_to_govtrack_id.values():
            if query_id in id_map:
                return self.govtrack_id_to_profile[id_map[query_id]]
        print("ID not found:", query_id)
        return None


    def __add_profile_helper(self, row):
        # check for ID existence/duplicate
        if not self.__check_id_helper(
            row,
            'govtrack_id',
            self.govtrack_id_to_profile,
        ):
            print("govtrack_id does not exist or is duplicate:", row)
            raise RuntimeError()
        id_fields = set()
        for id_field, id in row.items():
            if id_field != 'govtrack_id' and id_field.endswith('_id'):
                if id is None or id.strip() == '':
                    continue
                id_fields.add(id_field)
                if id_field not in self.other_id_to_govtrack_id:
                    self.other_id_to_govtrack_id[id_field] = {}
                if not self.__check_id_helper(
                    row,
                    id_field,
                    self.other_id_to_govtrack_id[id_field],
                    False,
                ):
                    print(id_field, "is duplicate:", row)
                    raise RuntimeError()
        # add ID
        govtrack_id = row['govtrack_id']
        self.govtrack_id_to_profile[govtrack_id] = row
        for id_field in id_fields:
            id = row[id_field]
            self.other_id_to_govtrack_id[id_field][id] = govtrack_id


    @staticmethod
    def __check_id_helper(
        row,
        id_field,
        id_map,
        check_id_field_existence=True,
        check_duplicate_id=True,
    ):
        id = row[id_field]
        if check_id_field_existence and (id is None or id == ''):
            print("No", id_field, "for:", row)
            return False
        if check_duplicate_id and id in id_map:
            print("Duplicate", id_field, ":", row, id_map[id])
            return False
        return True


if __name__ == "__main__":
    main()
