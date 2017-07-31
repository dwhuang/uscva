#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import json

from file_walker import FileWalker
from array import array

class BillFinder:
    @staticmethod
    def find(input_path, output_path, scope, keywords):
        if scope.lower() != 'bill' and scope.lower() != 'amendment':
            print("Scope must be either 'bill' or 'amendment'")
            return

        results = []
        for fpath in FileWalker.walk(input_path, [
            r"^109|110|111|112|113|114|115$",
            r"^{}s$".format(scope),
            r"^.*$",
            r"^.*$",
            r"^data.json$",
        ]):
            with open(fpath, 'r') as fp:
                raw = json.load(fp)
                if BillFinder.__has_keyword(raw, keywords):
                    id = raw['{}_id'.format(scope)]
                    print(id)
                    results.append(id)

        with open(output_path + '/bill_finder_results.json', 'w') as fp:
            json.dump(results, fp, indent=4)


    @staticmethod
    def __has_keyword(struct, keywords):
        if isinstance(struct, list):
            for elm in struct:
                if BillFinder.__has_keyword(elm, keywords):
                    return True
        elif isinstance(struct, dict):
            for val in struct.values():
                if BillFinder.__has_keyword(val, keywords):
                    return True
        elif isinstance(struct, str):
            for keyword in keywords:
                if keyword in struct:
                    print(keyword, struct)
                    return True
        return False


def main(argv):
    if len(argv) <= 4:
        print("Usage: {} input_path output_path scope keyword1 keyword2 ...".format(argv[0]))
        print("  Returns bill IDs matching any of the keywords (case sensitive)")
        print()
        print("Example: {} ../../data out bill taiwan china".format(argv[0]))
        return
    
    BillFinder.find(argv[1], argv[2], argv[3], argv[4:])
    

if __name__ == "__main__":
    main(sys.argv)
