
import sys
import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt
from io import BytesIO  # for saving the images


def tset(sometext):
    # reverse the text
    print(sometext[::-1])


def create_plot11(x=None, y=None, a=None, b=None):
    """
    Creates a plot of some datapoints, along with a line ax + b. 
    Limits are -10 and +10 for both x and y. 
    Returns the plot as the value of a BytesIO object.
    """
    
    fig = mpl.figure.Figure()
    ax = fig.add_subplot(111)
    if x is not None and y is not None:
        ax.scatter(x, y, color=(4/255, 151/255, 185/255))
        if a is not None and b is not None:
            x_s = np.linspace(-10, 10, 200)
            y_s = a*x_s + b
            ax.plot(x_s, y_s, color=(185/255,38/255,4/255))
        ax.set_xlim(-10, 10)
        ax.set_ylim(-10, 10)
        # save the image to a BytesIO and return it
        img = BytesIO()
        fig.savefig(img, format='png')
        img.seek(0)
        fig.clear()

        mse = np.mean((a*x + b - y)**2)
        r2 = 1 - mse / np.var(y)

        return img.getvalue(), (mse, r2)

    else: 
        # set up the plot
        a = round(np.tan((np.random.random()/3)*np.pi), 3)
        b = round(np.random.randint(-5, 6), 3)
        x = np.random.randint(-10, 10, size=(100,))
        y = a*x + b + np.random.randn(0, 1.41, size=(100,))
        return x, y


def main():
    pass


if __name__ == '__main__':
    # Check if the correct number of arguments were provided

    if len(sys.argv) == 1:
        # just run the main code
        main()
    
    elif len(sys.argv) == 3:
        # run the function given by argv[1]
        if sys.argv[1] in globals():
            globals()[sys.argv[1]](sys.argv[2])
        else:
            raise ValueError("Function not found")
            # TODO: look into error handling
            sys.exit(1)
    
    else:
        raise ValueError("Use either no or two arguments")
        # TODO: look into error handling
        sys.exit(1)

