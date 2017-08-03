#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
sys.path.append("../../")
# -------------------------------

import pickle
from os.path import exists

from som.som import Som
from som.hexgrid import HexGrid
from som.utils import read_data
from som.utils import gen_random_data


data_fname = 'test_data.txt'
if not exists(data_fname):
    gen_random_data(data_fname, seed=7788)
labels, inputs = read_data(data_fname)

som = Som(grid=HexGrid(10), input_dim=inputs.shape[1])

som_fname = 'test.som'
som.train(inputs, 1000)
# save SOM to a file
with open(som_fname, 'wb') as fp:
    pickle.dump(som, fp, protocol=-1)
## load SOM from a file
#with open(som_fname, 'rb') as fp:
#    som = pickle.load(fp)

print(som.smoothness())
print(som.error(inputs))
som.grid.draw(som.weights)
