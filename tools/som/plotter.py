#!/usr/bin/env python
# -*- coding: utf-8 -*-
# http://matplotlib.org/api/pyplot_summary.html
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import rcParams
rcParams['ps.useafm'] = True
rcParams['pdf.use14corefonts'] = True
rcParams['text.usetex'] = True

SQRT3 = np.sqrt(3)

def draw_hexagon(ax, x, y, color, side=1):
    """Draw a single hexagon

    Args:
        ax: matplotlib axis
        x ,y (float): coordinates of the hexagon's center
        color: filling color of the hexagon
        side: length of the hexagon's side

    Returns:
        None
    """
    pts = np.array([[x, y + side],
                    [x - SQRT3 / 2, y + side / 2],
                    [x - SQRT3 / 2, y - side / 2],
                    [x, y - side],
                    [x + SQRT3 / 2, y - side / 2],
                    [x + SQRT3 / 2, y + side / 2]])
    ax.fill(pts[:, 0], pts[:, 1], color=color)


def plot_hex_grid(a, size, min=None, max=None):
    """Visualize an array as a hexagonal map

    Args:
        a (numpy.ndarray): 1D or 2D array. If 1D, contains values to be plotted.
                           If 2D, the size of the second dimension (column)
                           should be three. These values will be rendered as
                           RGB values.
        size (array): contains numbers of rows and columns of the map
        min, max (int): the minimum and maximum values in the array. If a is
                        2D, min and max should contain three values, one for
                        each column in a.
    Returns:
        None
    """
    if a.ndim == 1:
        # promote to 2D array
        a = np.tile(a[:, None], [1, 3])
    if min is None:
        min = np.min(a, axis=0)
    if max is None:
        max = np.max(a, axis=0)
    print('min =', min, ' max =', max)
    fig = plt.figure(figsize=(10, 6))
    ax = plt.subplot(1, 1, 1)
    for i in range(a.shape[0]):
        r, c = i // size[1], i % size[1]
        x = (c + (.5 if r % 2 == 1 else 0)) * SQRT3
        y = -r * 1.5
        val = (a[i, :] - min) / (max - min)
        draw_hexagon(ax, x, y, val)
    ax.set_aspect('equal')
    ax.set_axis_off()
    plt.tight_layout()
    #fig.savefig("fname", bbox_inches='tight')
    plt.show()


def main():
    a = np.random.rand(500)
    plot_hex_grid(a, [20, 25])


if __name__ == "__main__":
    main()
