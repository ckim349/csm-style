"""Module docstring."""
import os
__all__ = 1


# 4 space indentation check
if True:
  print('ding')

# Hanging indentation check
foo = long_function_name(var_one, var_two,
    var_three, var_four)
def long_function_name(
    var_one, var_two, var_three,
    var_four):
    print(var_one)
    
# Using tabs instead of spaces check
var_one = 1
if var_one == 1:
	print('ding')

# Line length check
print('ding ding ding ding ding ding ding ding ding ding ding ding ding dinging')

# 72 characters docstring 72 characters docstring 72 characters docstring

# Imports

import sys, os
from math import *

def area(radius):
    return pi * radius**2

# dunder names: __future__ import
from __future__ import barry_as_FLUFL

# String quotes
print("ding")
print(
    '''
    Yeah
    ''')

# White space
spam( ham[ 1 ], { eggs: 2 } )
if x == 4 : print(x , y) ; x , y = y , x
ham[lower + offset:upper + offset]
ham[1: 9], ham[1 :9], ham[1:9 :3]
ham[lower : : step]
ham[ : upper]
spam (1)
dct ['key'] = lst [index]
x             = 1
y             = 2
long_variable = 3
spam(1) 

def munge(input:AnyStr): ...
def munge()->PosInt: ...

def complex(real, imag = 0.0):
    return magic(r = real, i = imag)

if foo == 'blah': do_blah_thing()
else: do_non_blah_thing()

try: something()
finally: cleanup()

do_one(); do_two(); do_three(long, argument,
                             list, like, this)

if foo == 'blah': one(); two(); three()

# Trailing commas
FILES = 'setup.cfg',

FILES = ['setup.cfg', 'tox.ini',]
initialize(FILES, error=True,)

foo = {
    "bar": 1,
    "baz": 2
}

	# Comments (bad indentation)
x = x + 1# hello
#
# it's me
def average(values: list[float]) -> float:
    """Return the mean of the given values"""
#Block comment
x = x + 1  #Inline comment
x = x + 1  #  Inline comment
x = x + 1  # \xa0Inline comment

# Naming
l = 1
O = 1
I = 1

from typing import TypeVar

vt_co = TypeVar('VT_co', covariant=True)
kt_contra = TypeVar('kt_contra', contravariant=True)

Num = TypeVar('Num')

class Validation(Exception): ...

def CalculateSum(x, y):
    totalSum = x + y 
    return totalSum

def calculateSum(x, y):
    totalsum = x + y 
    return totalsum

class Example:
    @classmethod
    def function(self, data): ...
    
class Example:
    def function(cls, data): ...
    
def function(list):
    MAX_OVERFLOW = 1
    a = list + 1
    return a

# Programming recommendations

if not x is None:
    pass

f = lambda x: 2*x

class ValidationError(BaseException):
    pass

try:
    import platform_specific_module
except:
    platform_specific_module = None
    
# Annotations

code:int
code : int 

def check_value(x):
    if x > 0:
        return x
    else:
        return
    
def handle_input(x):
    if type(x) == str:
        print("Got a string")

if greeting == True:
    print("Hello!")
