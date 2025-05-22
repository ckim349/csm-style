def top_level_function1():
    pass
class TestClass(object):
    def class_method1():
        pass
    def class_method2():
        pass
class TestClass2(object):
    def class2_method1():
        pass
    def class2_method2():
        pass
test_class = TestClass2()

def outer():
    def inner():
        pass
    def inner2():
        pass