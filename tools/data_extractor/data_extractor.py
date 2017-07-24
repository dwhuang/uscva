#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json

"""
Questions to investigate:
1) Does each person has a unique ID?
"""

class DataExtractor:
    def __init__(self):
        self.voter_history = {}
        self.vote_id_map = {}

    def extract(self, input_path, output_path):
        """Output voting history for each voter
        """
        for root, _, files in os.walk(input_path):
            #if root != input_path + "106/votes/1999/s134":
            #    continue
            for fname in files:
                if fname == 'data.json':
                    self.__process_file("{}/{}".format(root, fname))

        with open(output_path + "/voter_history.json", "w") as fp:
            json.dump(self.voter_history, fp)
        with open(output_path + "/vote_id_map.json", "w") as fp:
            json.dump(self.vote_id_map, fp)


    def __process_file(self, fpath):
        print("processing " + fpath)
        with open(fpath, 'r') as fp:
            raw = json.load(fp)
            vote_id = raw['vote_id']

            if vote_id not in self.vote_id_map:
                self.vote_id_map[vote_id] = len(self.vote_id_map)
            vote_id = self.vote_id_map[vote_id]

            for vote, voters in raw['votes'].items():
                for voter in voters:
                    if voter == 'VP':
                        continue  # tie-breaking vice president vote
                    vid = voter['id']
                    display_name = voter['display_name']
                    if vid not in self.voter_history:
                        self.voter_history[vid] = {
                            'display_name': [display_name],
                            'votes': {},
                        }
                    else:
                        if display_name not in self.voter_history[vid]['display_name']:
                            self.voter_history[vid]['display_name'].append(display_name)
                    self.voter_history[vid]['votes'][vote_id] = vote


    @staticmethod
    def __merge_dict(d, d1, excluded_keys=set()):
        for k, v1 in d1.items():
            if k in excluded_keys:
                continue
            if k in d:
                if d[k] != v1:
                    print("merge error: key {} has different values {}, {}"
                          .format(k, d[k], v1))
                    raise RuntimeError()
            else:
                d[k] = v1


def main(argv):
    if len(argv) <= 2:
        print("must specify input and output paths")
        return

    DataExtractor().extract(argv[1], argv[2])
    

if __name__ == "__main__":
    main(sys.argv)
