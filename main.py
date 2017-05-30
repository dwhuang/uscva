#!/usr/bin/env python
# -*- coding: utf-8 -*-
import numpy as np
import pickle
from plotter import plot_hex_grid

class Som:
    SQRT3 = np.sqrt(3)

    def __init__(self, size, input_dim):
        self.param = {
            'size': size,
            'num_nodes': np.multiply.reduce(size),
            'input_dim': input_dim,
        }
        self.weights = self.__init_weights()
        self.node_dist_square = self.__build_hex_node_dist_square_map()
        self.activity = np.zeros(shape=(self.param['num_nodes'],))
        self.lr = np.zeros(shape=(self.param['num_nodes'],))
        self.nb = np.zeros(shape=(self.param['num_nodes'],))
        self.winner = -1
        self.wt_delta = np.zeros(shape=self.weights.shape)


    def save(self, fpath):
        with open(fpath, 'wb') as fp:
            pickle.dump({'param': self.param, 'weights': self.weights},
                        fp,
                        protocol=-1)


    def load(self, fpath):
        with open(fpath, 'rb') as fp:
            b = pickle.load(fp)
            self.param = b['param']
            self.weights = b['weights']


    def __init_weights(self):
        num_nodes = self.param['num_nodes']
        input_dim = self.param['input_dim']
        np.random.seed(5566)
        return np.random.rand(num_nodes, input_dim)


    # Assumptions about Euclidean coordinates for each hexagonal cell:
    # - The first node (top-left) is at (0, 0)
    # - Each side of a hexagonal grid is 1
    # - Each hexagon is oriented "pointy-topped"
    # - Odd rows are shifted towards the right
    def __build_hex_node_dist_square_map(self):
        size = self.param['size']
        num_nodes = self.param['num_nodes']
        # find Euclidean coordinates for each cell
        coords = np.ndarray(shape=(num_nodes, 2), dtype=np.float64)
        for i in range(num_nodes):
            r, c = i // size[1], i % size[1]
            coords[i, :] = (c + (.5 if r % 2 == 1 else 0)) * self.SQRT3, r * 1.5
        # find pairwise distances
        dist_map = np.sum((coords[:, None] - coords) ** 2, axis=-1)
        return dist_map


    def run(self, input):
        np.sum((self.weights - input) ** 2, axis=1, out=self.activity)
        self.winner = self.activity.argmin()
        return self.winner


    def __neighborhood_func(self, trn_progress):
        sigma = self.__nonlinear_decr_func(trn_progress, 5, 0, 0.5, 0.3)
        np.exp(-0.5 * self.node_dist_square[:, self.winner] / sigma ** 2,
               out=self.nb)
        return self.nb


    def __nonlinear_decr_func(self, trn_progress, init, fin, infl, sigma):
        return fin + (init - fin) / (1 + np.exp((trn_progress - infl) / sigma))


    def __immediate_neighbor_indices(self, ind):
        num_row, num_col = self.param['size']
        r, c = ind // num_col, ind % num_col
        ret = []
        ret.append((r, c - 1))
        ret.append((r, c + 1))
        if r % 2 == 0:
            ret.append((r - 1, c - 1))
            ret.append((r - 1, c))
            ret.append((r + 1, c - 1))
            ret.append((r + 1, c))
        else:
            ret.append((r - 1, c))
            ret.append((r - 1, c + 1))
            ret.append((r + 1, c))
            ret.append((r + 1, c + 1))
        ret = filter(lambda p: 0 <= p[0] < num_row and 0 <= p[1] < num_col,
                     ret)
        ret = [(p[0] * num_col + p[1]) for p in ret]
        return np.array(ret)


    def learn(self, input, trn_progress):
        self.run(input)
        learning_rate = self.__nonlinear_decr_func(trn_progress,
                                                   0.3, 0, 0.3, 0.001)
        self.lr.fill(learning_rate)
        self.__neighborhood_func(trn_progress)
        np.multiply(self.lr, self.nb, out=self.lr)
        np.subtract(input, self.weights, out=self.wt_delta)
        np.multiply(self.wt_delta, self.lr[:, None], out=self.wt_delta)
        np.add(self.weights, self.wt_delta, out=self.weights)


    def train(self, inputs, num_epochs):
        num_inputs = inputs.shape[0]
        for epoch in range(num_epochs):
            if epoch % 100 == 0:
                print('epoch', epoch)
            trn_progress = epoch / (num_epochs - 1) if num_epochs > 1 else 1
            permu = np.random.permutation(num_inputs)
            for i in range(num_inputs):
                input = inputs[permu[i]]
                self.learn(input, trn_progress)


    def smoothness(self):
        wt_jump_avg = np.zeros(self.param['num_nodes'])
        for i in range(self.param['num_nodes']):
            nb_inds = self.__immediate_neighbor_indices(i)
            nb_wts = self.weights[nb_inds, :]
            my_wts = self.weights[i, :]
            wt_jump_avg[i] = np.average((((nb_wts - my_wts) ** 2).sum(axis=1) ** .5))
        return np.average(wt_jump_avg)


def gen_random_data(fpath, seed=7788):
    np.random.seed(seed)
    d = np.random.rand(100, 3)
    with open(fpath, 'w') as fp:
        for i in range(100):
            print("d%03d %f %f %f" % (i, d[i, 0], d[i, 1], d[i, 2]), file=fp)


def read_data(fpath):
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
            data.append([np.float64(x) for x in toks[1:]])
    return labels, np.array(data)


def main():
    labels, inputs = read_data('test_data.txt')
    som = Som(size=(10, 15), input_dim=inputs.shape[1])

    som.train(inputs, 1000)
    som.save('test.som')

    som.load('test.som')
    plot_hex_grid(som.weights, som.param['size'])
    print(som.smoothness())


if __name__ == "__main__":
    main()
