#!/usr/bin/env python
# -*- coding: utf-8 -*-
import numpy as np
import pickle
import warnings
import traceback
from hexgrid import HexGrid

np.seterr(all='warn')
warnings.simplefilter('error')
warnings.filterwarnings('ignore', 'underflow')

class Som:
    '''Self-organizing map implementation
    '''
    def __init__(self, grid, input_dim, **kwargs):
        '''Construct a SOM

           grid: a grid object representing the map layer
           input_dim: number of input dimensions
           kwargs: other parameters such as learning rate function parameters
        '''
        # hyper parameters
        self.grid = grid
        self.num_nodes = grid.size
        self.input_dim = input_dim
        self.nb_init = kwargs.get('nb_init', .9)
        self.nb_infl = kwargs.get('nb_infl', .4)
        self.nb_sigma = kwargs.get('nb_sigma', .01)
        self.lr_init = kwargs.get('lr_init', .4)
        self.lr_infl = kwargs.get('lr_infl', .4)
        self.lr_sigma = kwargs.get('lr_sigma', .001)
        # states
        self.weights = self.__init_weights()
        self.activity = np.zeros(shape=(self.num_nodes,))
        self.lr = np.zeros(shape=(self.num_nodes,))
        self.nb = np.zeros(shape=(self.num_nodes,))
        self.winner = -1
        self.delta_weights = np.zeros(shape=self.weights.shape)


    def __init_weights(self, seed=5566):
        '''Random weight initialization
        '''
        np.random.seed(seed)
        return np.random.rand(self.num_nodes, self.input_dim)


    def run(self, input_vec):
        '''Run the SOM once, taking an input vector and producing an activity
           pattern as well as a winner
        '''
        np.sum((self.weights - input_vec) ** 2, axis=1, out=self.activity)
        self.winner = self.activity.argmin()
        return self.winner


    def __compute_nb(self, trn_progress):
        '''Produce a neighborhood function around the winner for training.
           The value for the winner locaiton is one. The value decreases
           exponentially as one moves away from the winner location.

           trn_progress: training progress, between 0 and 1. As training
                         progresses, the function becomes more and more
                         focused on the winner.
        '''
        gamma = self.__nonlinear_decr_func(trn_progress,
                                           self.nb_init,
                                           0,
                                           self.nb_infl,
                                           self.nb_sigma)
        # gamma must be < 1 for this to work
        np.float_power(gamma, self.grid.get_dist_map(self.winner), out=self.nb)
        self.nb[self.nb < 1e-6] = 0
        return self.nb


    def __nonlinear_decr_func(self, trn_progress, init, fin, infl, sigma):
        try:
            ret = fin + (init - fin) / (1 + np.exp((trn_progress - infl) / sigma))
        except RuntimeWarning as e:
            ret = fin
        return ret


    def learn(self, input_vec, trn_progress):
        '''Adapt the weights once based on the input vector and the current
           activity and winner
        '''
        self.run(input_vec)
        lr = self.__nonlinear_decr_func(trn_progress,
                                        self.lr_init,
                                        0,
                                        self.lr_infl,
                                        self.lr_sigma)
        self.lr.fill(lr)
        self.__compute_nb(trn_progress)
        np.multiply(self.lr, self.nb,
                    out=self.lr)
        np.subtract(input_vec, self.weights,
                    out=self.delta_weights)
        np.multiply(self.delta_weights, self.lr[:, None],
                    out=self.delta_weights)
        np.add(self.weights, self.delta_weights,
               out=self.weights)


    def train(self, inputs, num_epochs):
        '''Train the SOM

           inputs: row vectors of input vectors
           num_epochs: number of epochs
        '''
        num_inputs = inputs.shape[0]
        for epoch in range(num_epochs):
            if epoch % 100 == 0:
                print('epoch', epoch)
            trn_progress = epoch / (num_epochs - 1) if num_epochs > 1 else 1
            permu = np.random.permutation(num_inputs)
            for i in range(num_inputs):
                input_vec = inputs[permu[i]]
                self.learn(input_vec, trn_progress)


    def smoothness(self):
        '''Smoothness metric: average weight changes from a node to all its
           neighbors, averaged over all nodes
        '''
        wt_jump_avg = np.zeros(self.num_nodes)
        for i in range(self.num_nodes):
            nb_inds = self.grid.get_neighbors(i)
            nb_wts = self.weights[nb_inds, :]
            my_wts = self.weights[i, :]
            wt_jump_avg[i] = np.average((((nb_wts - my_wts) ** 2).sum(axis=1) ** .5))
        return np.average(wt_jump_avg)

    def error(self, inputs, print_details=False):
        '''Average error: error between each input vector and the winning node's
           weights, averaged over all input vectors
        '''
        err = 0
        for input_vec in inputs:
            winner = self.run(input_vec)
            err += np.sum((self.weights[winner, :] - input_vec) ** 2) ** .5
            if print_details:
                print(self.weights[winner, :],
                      input_vec,
                      np.sum((self.weights[winner, :] - input_vec) ** 2) ** .5)
        return err / len(inputs)


def gen_random_data(fpath, seed=7788):
    '''Generate random 3D data for testing
    '''
    np.random.seed(seed)
    d = np.random.rand(100, 3)
    with open(fpath, 'w') as fp:
        for i in range(100):
            print("d%03d %f %f %f" % (i, d[i, 0], d[i, 1], d[i, 2]), file=fp)


def read_data(fpath):
    '''Read input data from a file
    '''
    with open(fpath, 'r') as fp:
        lines = fp.readlines()
        input_dim = 0
        data = []
        labels = []
        for i, line in enumerate(lines):
            toks = line.split(' ')
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


def main():
    #parameter_sweep()
    labels, inputs = read_data('test_data.txt')
    som = Som(grid=HexGrid(10), input_dim=inputs.shape[1])

    som.train(inputs, 1000)
    # save SOM to a file
    with open('test.som', 'wb') as fp:
        pickle.dump(som, fp, protocol=-1)
    # load SOM from a file
    with open('test.som', 'rb') as fp:
        som = pickle.load(fp)

    print(som.smoothness())
    print(som.error(inputs))
    som.grid.draw(som.weights)


if __name__ == "__main__":
    main()
