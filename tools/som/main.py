#!/usr/bin/env python
# -*- coding: utf-8 -*-
import numpy as np
#np.set_printoptions(threshold=np.nan)

class Som:
    SQRT3 = np.sqrt(3)

    def __init__(self, size, input_dim):
        self.param = {
            'size': size,
            'num_nodes': np.multiply.reduce(size),
            'input_dim': input_dim,
        }
        self.weights = self.__init_weights()
        self.node_dist = self.__build_hex_node_dist_map()
        self.activity = np.zeros(shape=(self.param['num_nodes'],))
        self.winner = -1

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
    def __build_hex_node_dist_map(self):
        size = self.param['size']
        num_nodes = self.param['num_nodes']
        # find Euclidean coordinates for each cell
        coords = np.ndarray(shape=(num_nodes, 2), dtype=np.float64)
        for i in range(num_nodes):
            r, c = i // size[1], i % size[1]
            coords[i, :] = (c + (.5 if r % 2 == 1 else 0)) * self.SQRT3, r * 1.5
        # find pairwise distances
        dist_map = np.sqrt(np.sum((coords[:, None] - coords) ** 2, axis=-1))
        return dist_map

    def run(self, input):
        np.sum((self.weights - input) ** 2, axis=1, out=self.activity)
        self.activity.argmin(out=self.winner)
        return self.winner

    def learn(self, input):
        pass

    def train(self, inputs):
        pass


def main():
    som = Som(size=(2, 3), input_dim=3)
    som.run((1, 0, 1))

if __name__ == "__main__":
    main()
