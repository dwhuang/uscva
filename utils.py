#!/usr/bin/env python
# -*- coding: utf-8 -*-

import numpy as np

def gen_random_data(fpath, seed=7788):
    '''Generate random 3D data for testing
    '''
    np.random.seed(seed)
    d = np.random.rand(100, 3)
    with open(fpath, 'w') as fp:
        for i in range(100):
            print("d%03d %f %f %f" % (i, d[i, 0], d[i, 1], d[i, 2]), file=fp)


def read_data(fpath, delimiter='\t'):
    '''Read input data from a file
    '''
    with open(fpath, 'r') as fp:
        lines = fp.readlines()
        input_dim = 0
        data = []
        labels = []
        for i, line in enumerate(lines):
            toks = line.split(delimiter)
            tok_count = len(toks)
            if tok_count <= 1:
                raise RuntimeError("Not enough tokens in line:", i)
            if input_dim == 0:
                input_dim = tok_count - 1
            elif tok_count - 1 != input_dim:
                raise RuntimeError("Input dimensions do not agree:",
                                   tok_count - 1,
                                   input_dim)
            labels.append(toks[0])
            data.append([np.float(x) for x in toks[1:]])
    return labels, np.array(data)


def parameter_sweep():
    '''Sweep to find a good combination of parameters. Modify as needed.
    '''
    labels, inputs = read_data('test_data.txt')
    with open('sweep_nb.log', 'w') as fp:
        for init in [.4, .2, .1, .01]:
            for infl in [.3, .4, .5, .6, .7]:
                for sigma in [0.1, 0.01, 0.001, 0.0001]:
                    print("%d, %.2f, %.4f" % (init, infl, sigma))
                    som = Som(grid=HexGrid(10),
                              input_dim=inputs.shape[1],
                              nb_init=.9,
                              nb_infl=.4,
                              nb_sigma=.01,
                              lr_init=init,
                              lr_infl=infl,
                              lr_sigma=sigma)
                    som.train(inputs, 1000)
                    fp.write("{init},{infl:.2f},{sigma:.4f},{smoothness:.4f},"
                             "{error:.4f}\n"
                             .format(init=init,
                                     infl=infl,
                                     sigma=sigma,
                                     smoothness=som.smoothness(),
                                     error=som.error(inputs)))
                    fp.flush()

