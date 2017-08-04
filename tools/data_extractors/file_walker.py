#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Regular expression based directory traversal
"""
import os
from os import path
import re

class FileWalker:
    @staticmethod
    def walk(root, patterns):
        pattern = patterns[0]
        for fname in os.listdir(root):
            match = re.search(pattern, fname)
            if match:
                fpath = root + '/' + fname
                if path.isfile(fpath) and len(patterns) == 1:
                    yield fpath
                elif path.isdir(fpath) and len(patterns) > 1:
                    yield from FileWalker.walk(fpath, patterns[1:])


def main():
    # Sample: ../../data/109/votes/2005/h1/data.json
    for fpath in FileWalker.walk(
        "../../data",
        [
            r"^\d{1,3}$",
            r"^votes$",
            r"^\d{4}$",
            r"^[hs]\d+$",
            r"^data.json$",
        ],
    ):
        print(fpath)


if __name__ == "__main__":
    main()
