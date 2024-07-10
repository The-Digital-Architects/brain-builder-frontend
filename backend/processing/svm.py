"""
This module contains the backend code for the SVM tasks. 
Work in progress.
"""

# TODOs: 
# ...

import sys
if __name__ == '__main__':
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))

from communication import send_error, send_image, is_cancelled
import numpy as np
from sklearn.svm import SVC

...
