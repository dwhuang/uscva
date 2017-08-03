#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
sys.path.append("../")

import pickle
from os.path import exists

from som.som import Som
from som.hexgrid import HexGrid
from som.utils import read_data
from som.utils import gen_random_data

if len(sys.argv) <= 1:
    print("Usage: {} train|load".format(sys.argv[0]))
    sys.exit()


data_fname = 'out/CongressMemberFeatures.output.csv'
labels, inputs = read_data(data_fname, delimiter=',')

som = Som(grid=HexGrid(10), input_dim=inputs.shape[1])

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
else:
    print("Unknown command {}".format(sys.argv[1]))
    sys.exit()

print(som.smoothness())
print(som.error(inputs))
print(som.weights[20:30, 20:30])
#som.grid.draw(som.weights)
