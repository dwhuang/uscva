#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json
import re

"""
Questions to investigate:
1) Does each person has a unique ID?
"""

DEBUG = False
DEBUG_FILE_COUNT = None
DEBUG_PATH = None


class CongressMember:
    histogram = {}


    @staticmethod
    def histogram_reset():
        CongressMember.histogram = {}


    @staticmethod
    def histogram_increment(key, bin):
        if key not in CongressMember.histogram:
            CongressMember.histogram[key] = {}
        if bin not in CongressMember.histogram[key]:
            CongressMember.histogram[key][bin] = 0
        CongressMember.histogram[key][bin] += 1


    @staticmethod
    def save_histograms(output_path):
        for key in CongressMember.histogram:
            with open(output_path + "/h_{}.csv".format(key), "w") as fp:
                for bin, count in sorted(CongressMember.histogram[key].items()):
                    fp.write("{},{}\n".format(bin, count))


    def __init__(self, id):
        self.id = id
        self.display_names = []
        self.votes = {}


    def set_display_name(self, display_name):
        if display_name not in self.display_names:
            self.display_names.append(display_name)


    def vote(self, vote_id, vote):
        self.votes[vote_id] = vote

        # vote counts for 'yea', 'nay', etc. across all voting events
        self.histogram_increment('votes', vote)
        # total vote counts for each voting event (vote_id)
        self.histogram_increment('vote_ids', vote_id)
        # vote counts for each congress member
        self.histogram_increment('members', self.id)


    def to_dict(self):
        return {
            'id': self.id,
            'display_names': [dn for dn in self.display_names],
            'votes': self.votes,
        }


class DataExtractor:
    VOTE_VALUE = {
        'aye': 1,
        'nay': -1,
        'no': -1,
        'not voting': 0,
        'present': 0,
        'yea': 1,
    }


    def __init__(self):
        self.congress_members = {}


    def extract(self, input_path, output_path):
        """Output voting history for each voter

           Output samples:

           "P000449": {
               "display_name": [
                   "Portman"
               ],
               "votes": {
                   "0": "Present",
                   "1": "Aye",
                   "2": "No",
                   "3": "Aye",
                   "4": "Yea",
                   ...
               }
           },
           ...

        """
        file_count = 0
        for root, _, files in os.walk(input_path):
            if DEBUG and DEBUG_PATH is not None and root != input_path + DEBUG_PATH:
                continue
            for fname in files:
                if fname == 'data.json':
                    self.__process_file("{}/{}".format(root, fname))
                    file_count += 1
            if DEBUG and DEBUG_FILE_COUNT is not None and file_count >= DEBUG_FILE_COUNT:
                break

        if DEBUG:
            print(
                json.dumps(
                    [m.to_dict() for _, m in self.congress_members.items()],
                    indent=4,
                ),
            )
            print(CongressMember.histogram)

        with open(output_path + "/congress_member_votes.json", "w") as fp:
            json.dump(
                [m.to_dict() for _, m in sorted(self.congress_members.items())],
                fp,
            )
        CongressMember.save_histograms(output_path)


    def __process_file(self, fpath):
        with open(fpath, 'r') as fp:
            raw = json.load(fp)
            for vote in raw['votes']:
                if vote.lower().strip() not in self.VOTE_VALUE:
                    print("Unknown vote {} in {}; skip".format(vote, fpath))
                    return

            vote_id = raw['vote_id']
            for vote, voters in raw['votes'].items():
                vote = self.VOTE_VALUE[vote.lower().strip()]
                for voter in voters:
                    if voter == 'VP':
                        continue  # tie-breaking vice president vote
                    member = self.__get_or_create_congress_member(voter['id'])
                    member.set_display_name(voter['display_name'])
                    member.vote(vote_id, vote)


    def __get_or_create_congress_member(self, id):
        if id not in self.congress_members:
            self.congress_members[id] = CongressMember(id)
        return self.congress_members[id]


def main(argv):
    if len(argv) <= 2:
        print("must specify input and output paths")
        return

    DataExtractor().extract(argv[1], argv[2])
    

if __name__ == "__main__":
    main(sys.argv)
