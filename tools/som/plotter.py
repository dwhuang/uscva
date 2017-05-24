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
    pts = np.array([[x, y + side],
                    [x - SQRT3 / 2, y + side / 2],
                    [x - SQRT3 / 2, y - side / 2],
                    [x, y - side],
                    [x + SQRT3 / 2, y - side / 2],
                    [x + SQRT3 / 2, y + side / 2]])
    ax.fill(pts[:, 0], pts[:, 1], color=color)

def plot_hex_grid(a, size):
    fig = plt.figure(figsize=(10, 6))
    ax = plt.subplot(1, 1, 1)
    for i in range(len(a)):
        r, c = i // size[1], i % size[1]
        x = (c + (.5 if r % 2 == 1 else 0)) * SQRT3
        y = -r * 1.5
        draw_hexagon(ax, x, y, [a[i], a[i], a[i]])
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
