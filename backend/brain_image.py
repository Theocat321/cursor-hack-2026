import base64
import io

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


def generate_brain_images(preds: np.ndarray) -> list[str]:
    """
    Given preds of shape (n_timesteps, n_vertices), generate two brain PNGs:
      [0] lateral view  – left/right hemispheres from the side
      [1] medial view   – left/right hemispheres from the inside

    Returns a list of two base64-encoded PNG strings.
    """
    from nilearn.datasets import fetch_surf_fsaverage
    from nilearn.plotting import plot_surf_stat_map

    activation = preds.mean(axis=0).astype(np.float64)  # (n_vertices,)
    n_per_hemi = len(activation) // 2
    left_data = activation[:n_per_hemi]
    right_data = activation[n_per_hemi:]

    fsaverage = fetch_surf_fsaverage("fsaverage5")

    view_pairs = [
        ("lateral", "lateral"),
        ("medial", "medial"),
    ]
    images = []
    for left_view, right_view in view_pairs:
        fig, axes = plt.subplots(
            1, 2,
            figsize=(8, 4),
            subplot_kw={"projection": "3d"},
            gridspec_kw={"wspace": 0, "hspace": 0},
        )
        fig.patch.set_facecolor("#1e293b")

        plot_surf_stat_map(
            fsaverage.infl_left, left_data,
            hemi="left", view=left_view,
            bg_map=fsaverage.sulc_left,
            cmap="hot", colorbar=False,
            axes=axes[0], figure=fig,
        )
        plot_surf_stat_map(
            fsaverage.infl_right, right_data,
            hemi="right", view=right_view,
            bg_map=fsaverage.sulc_right,
            cmap="hot", colorbar=False,
            axes=axes[1], figure=fig,
        )
        for ax in axes:
            ax.set_box_aspect(None, zoom=1.3)

        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", dpi=120, facecolor="#1e293b")
        plt.close(fig)
        buf.seek(0)
        images.append(base64.b64encode(buf.read()).decode("utf-8"))

    return images
