#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Search through all bill metadata fields for keywords.

Output a list of bill IDs that has any of the keywords.
"""
import sys
import json
import re

from file_walker import FileWalker
from array import array

class BillFinder:
    @staticmethod
    def find(config):
        keywords = config['bill_keywords']
        if len(keywords) == 0:
            print("No keywords provided")
            return

        results = {}
        all_bill_urls = {}
        for fpath in FileWalker.walk(
            config['input_path'],
            config['bill_data_path_patterns'],
        ):
            with open(fpath, 'r') as fp:
                raw = json.load(fp)
                id = None
                for bill_id_field in config['possible_bill_id_fields']:
                    if bill_id_field in raw:
                        id = raw[bill_id_field]
                if id is None:
                    print("Cannot determine bill ID")
                    raise RuntimeError()
                if BillFinder.__has_keyword(raw, keywords):
                    print(id)
                    if 'url' in raw:
                        url = raw['url']
                        if url.endswith('.xml'):
                            url = BillFinder.__synthesizeURL(id)
                        results[id] = url
                    elif 'amends_bill' in raw and 'bill_id' in raw['amends_bill']:
                        results[id] = raw['amends_bill']['bill_id']
                    else:
                        raise RuntimeError(
                            "Cannot determine URL or bill ID for",
                            id,
                        )
                if 'url' in raw:
                    url = raw['url']
                    if url.endswith('.xml'):
                        url = BillFinder.__synthesizeURL(id)
                    all_bill_urls[id] = url

        # amendment values are now bills ids, find their URLs
        for id, value in results.items():
            if not value.startswith('http'):
                if value not in all_bill_urls:
                    print("Cannot resolve URL for", id, value)
                    continue
                results[id] = all_bill_urls[value]

        with open(
            "{}/{}-bills.json".format(
                config['output_path'],
                config['name'],
            ),
            'w',
        ) as fp:
            json.dump(results, fp, indent=2)


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

    
    BILL_CATEGORIES = {
        'conres': 'C',
        'jres': 'J',
        'r': 'R',
        'res': 'E',
        '': 'N',
    }


    @staticmethod
    def __synthesizeURL(bill_id):
        m = re.match(r"^([hs])([a-z]*)(\d+)-(\d+)$", bill_id.strip().lower())
        if m is None:
            return None
        g = m.groups()
        prefix1 = g[0].upper()
        prefix2 = BillFinder.BILL_CATEGORIES.get(g[1])
        if prefix2 is None:
            return None

        return "http://thomas.loc.gov/cgi-bin/bdquery/z?d{}:{}{}{}:@@@L&summ2=m&".format(
            g[3], prefix1, prefix2, g[2]
        )


def main(argv):
    if len(argv) < 2:
        print("Usage: {} config".format(argv[0]))
        print("  Generate bill IDs matching any of the keywords (case sensitive)")
        return
    
    with open(argv[1], 'r') as fp:
        config = json.load(fp)
        BillFinder.find(config)
    

if __name__ == "__main__":
    main(sys.argv)
