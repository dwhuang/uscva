#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Self-organizing map training script
"""
import sys
sys.path.append("../")

import pickle
from os.path import exists

from som.som import Som
from som.hexgrid import HexGrid
from som.utils import read_data
from som.utils import gen_random_data
from som.utils import parameter_sweep

if len(sys.argv) <= 1:
    print("Usage: {} train|load|parameter_sweep".format(sys.argv[0]))
    sys.exit()


data_fname = 'out/CongressMemberFeatures.output.tsv'
labels, inputs = read_data(data_fname)

som = Som(grid=HexGrid(20), input_dim=inputs.shape[1])

som_fname = 'out/test.som'
if sys.argv[1] == 'train':
    som.train(inputs, 1000)
    # save SOM to a file
    with open(som_fname, 'wb') as fp:
        pickle.dump(som, fp, protocol=-1)
elif sys.argv[1] == 'load':
    # load SOM from a file
    with open(som_fname, 'rb') as fp:
        som = pickle.load(fp)
elif sys.argv[1] == 'parameter_sweep':
    parameter_sweep(10, data_fname, 'out/parameter_sweep.log',
        [0.9, 0.75, 0.6], [0.4, 0.5, 0.6], [0.01, 0.001, 0.0001],
        [0.4, 0.3, 0.2], [0.4, 0.5, 0.6], [0.01, 0.001, 0.0001],
    )
else:
    print("Unknown command {}".format(sys.argv[1]))
    sys.exit()

print(som.smoothness())
print(som.error(inputs))
print(som.weights[20:30, 20:30])
#som.grid.draw(som.weights)
