# Missing docstring in public module

# Missing docstring in public package
__all__ = ["Player", "Game"]

def _private_method(self):
    pass

def public_function(self):
    # Missing docstring in public function
    pass

class Circle:
    # Missing docstring in public class

    def __init__(self, radius):
        # Missing docstring in __init__
        self.radius = radius

    def public_function():
        # Missing docstring in public method
        pass

class Cat(Animal):
    def __str__(self) -> str:
        # Missing docstring in method 
        return f"Cat: {self.name}"

"""Return a foobang

Optional plotz says to frobnicate the bizbaz first."""

