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

from som.som import Som
from som.hexgrid import HexGrid
from som.utils import read_data
from som.utils import gen_random_data
from som.utils import parameter_sweep

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
    grid=HexGrid(20),
    input_dim=inputs.shape[1],
    nb_init=0.9,
    nb_infl=0.4,
    nb_sigma=0.01,
    lr_init=0.4,
    lr_infl=0.6,
    lr_sigma=0.0001,
    input_ranges=[
        np.min(inputs, axis=0),
        np.max(inputs, axis=0),
    ],
)

som_fname = '{}/{}-model.som'.format(
    config['output_path'],
    config['name'],
)
if command == 'train':
    som.train(inputs, 1000)
    print(som.smoothness())
    print(som.error(inputs))
    # save SOM to a file
    with open(som_fname, 'wb') as fp:
        pickle.dump(som, fp, protocol=-1)
elif command == 'load':
    # load SOM from a file
    with open(som_fname, 'rb') as fp:
        som = pickle.load(fp)
    print(som.smoothness())
    print(som.error(inputs))
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
else:
    print("Unknown command {}".format(command))
    sys.exit()

#print(som.weights[20:30, 20:30])
#som.grid.draw(som.weights)
