#!/usr/bin/env python
# -*- coding: utf-8 -*-
import numpy as np

# Hexagonal grid reference: http://www.redblobgames.com/grids/hexagons/

SQRT3 = np.sqrt(3)

class HexGrid:
    def __init__(self, radius):
        self.radius = radius
        self.__a2l_map = []  # axial to linear mapping
        self.__l2a_map = []  # linear to axial mapping
        self.size = 0
        self.__build_index_maps()
        self.__dist_map = np.zeros(shape=(self.size, self.size))
        self.__build_dist_map()


    def __build_index_maps(self):
        """ Precompute mapping between axial coordinates and linear indices
        """
        i = 0
        for p in range(-self.radius, self.radius + 1):
            a2l_row = []
            for q in range(self.__min_q(p), self.__max_q(p) + 1):
                a2l_row.append(i)
                self.__l2a_map.append((p, q))
                i += 1
            self.__a2l_map.append(a2l_row)
        self.size = i


    def __build_dist_map(self):
        for i, _, _ in self.__iterator():
            for j, _, _ in self.__iterator():
                self.__dist_map[i, j] = self.dist(i, j)


    def axial_to_linear(self, p, q):
        return self.__a2l_map[p + self.radius][q - self.__min_q(p)]


    def linear_to_axial(self, ind):
        return self.__l2a_map[ind]


    def __min_q(self, p):
        return -min(p, 0) - self.radius


    def __max_q(self, p):
        return -max(p, 0) + self.radius


    def __iterator(self):
        i = 0
        for p in range(-self.radius, self.radius + 1):
            for q in range(self.__min_q(p), self.__max_q(p) + 1):
                yield i, p, q
                i += 1


    def draw(self, colors):
        import matplotlib.pyplot as plt
        from matplotlib.collections import PolyCollection

        fig = plt.figure(figsize=(9, 9))
        ax = plt.subplot(1, 1, 1)
        shapes = []
        for i, p, q in self.__iterator():
            x = p * 0.5 * SQRT3 + q * SQRT3
            y = -p * 1.5
            v1 = (x, y + 1)
            v2 = (x + 0.5 * SQRT3, y + 0.5)
            v3 = (x + 0.5 * SQRT3, y - 0.5)
            v4 = (x, y - 1)
            v5 = (x - 0.5 * SQRT3, y - 0.5)
            v6 = (x - 0.5 * SQRT3, y + 0.5)
            #ax.text(x, y, '%d' % i, ha='center', va='center')
            shapes.append((v1, v2, v3, v4, v5, v6))
        collection = PolyCollection(shapes, facecolors=colors)
        ax.add_collection(collection)

        ax.autoscale_view()
        ax.set_aspect('equal')
        ax.set_axis_off()
        plt.tight_layout()
        #fig.savefig("fname", bbox_inches='tight')
        plt.show()


    def dist(self, ind1, ind2):
        p1, q1 = self.linear_to_axial(ind1)
        p2, q2 = self.linear_to_axial(ind2)
        r1 = -p1 - q1
        r2 = -p2 - q2
        return int((abs(p1 - p2) + abs(q1 - q2) + abs(r1 - r2)) / 2)


    def get_dist_map(self, ind):
        return self.__dist_map[:, ind]


    def get_neighbors(self, ind):
        p, q = self.linear_to_axial(ind)
        ret = []
        for dp, dq in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, 1), (1, -1)]:
            pp = p + dp
            qq = q + dq
            if (pp >= -self.radius and pp <= self.radius) and (
                    qq >= self.__min_q(pp) and qq <= self.__max_q(pp)):
                ret.append(self.axial_to_linear(pp, qq))
        return ret


def main():
    g = HexGrid(3)
    g.draw(np.random.rand(g.size, 3))
    print(g.dist(0, 10))


if __name__ == "__main__":
    main()
