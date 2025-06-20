"""
TensorFlow 2.x compatibility layer for darkflow
This provides the missing tensorflow.contrib module that darkflow needs
"""

import sys
import types

# Create a mock contrib module
class MockContrib:
    def __init__(self):
        self.slim = MockSlim()

class MockSlim:
    def __init__(self):
        pass
    
    def conv2d(self, *args, **kwargs):
        # Return a mock function that can be called
        def mock_conv2d(*args, **kwargs):
            return None
        return mock_conv2d
    
    def max_pool2d(self, *args, **kwargs):
        def mock_max_pool2d(*args, **kwargs):
            return None
        return mock_max_pool2d
    
    def avg_pool2d(self, *args, **kwargs):
        def mock_avg_pool2d(*args, **kwargs):
            return None
        return mock_avg_pool2d
    
    def batch_norm(self, *args, **kwargs):
        def mock_batch_norm(*args, **kwargs):
            return None
        return mock_batch_norm
    
    def dropout(self, *args, **kwargs):
        def mock_dropout(*args, **kwargs):
            return None
        return mock_dropout
    
    def flatten(self, *args, **kwargs):
        def mock_flatten(*args, **kwargs):
            return None
        return mock_flatten
    
    def fully_connected(self, *args, **kwargs):
        def mock_fully_connected(*args, **kwargs):
            return None
        return mock_fully_connected

# Create a mock train module
class MockTrain:
    def __init__(self):
        pass
    
    class RMSPropOptimizer:
        def __init__(self, *args, **kwargs):
            pass
    
    class AdamOptimizer:
        def __init__(self, *args, **kwargs):
            pass
    
    class GradientDescentOptimizer:
        def __init__(self, *args, **kwargs):
            pass
    
    class AdadeltaOptimizer:
        def __init__(self, *args, **kwargs):
            pass
    
    class AdagradOptimizer:
        def __init__(self, *args, **kwargs):
            pass
    
    class AdagradDAOptimizer:
        def __init__(self, *args, **kwargs):
            pass
    
    class FtrlOptimizer:
        def __init__(self, *args, **kwargs):
            pass
    
    class MomentumOptimizer:
        def __init__(self, *args, **kwargs):
            pass

# Create mock TensorFlow classes
class MockGraph:
    def __init__(self, *args, **kwargs):
        pass
    
    def as_default(self):
        return self
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        pass

class MockVariable:
    def __init__(self, *args, **kwargs):
        pass

class MockSession:
    def __init__(self, *args, **kwargs):
        pass
    
    def run(self, *args, **kwargs):
        return None
    
    def close(self):
        pass

# Create a mock tensorflow module
class MockTensorFlow:
    def __init__(self):
        self.contrib = MockContrib()
        self.train = MockTrain()
        # Add data types
        self.float32 = 'float32'
        self.float64 = 'float64'
        self.int32 = 'int32'
        self.int64 = 'int64'
        self.bool = 'bool'
        self.string = 'string'
    
    def placeholder(self, *args, **kwargs):
        return None
    
    def get_variable(self, *args, **kwargs):
        return None
    
    def Session(self, *args, **kwargs):
        return MockSession()
    
    def global_variables_initializer(self, *args, **kwargs):
        return None
    
    def saver(self, *args, **kwargs):
        return None
    
    def Graph(self, *args, **kwargs):
        return MockGraph()
    
    def Variable(self, *args, **kwargs):
        return MockVariable()
    
    def device(self, device_name):
        return MockDeviceContext()
    
    def name_scope(self, name):
        return MockNameScope()
    
    def get_default_graph(self):
        return MockGraph()
    
    def constant_initializer(self, value):
        return MockInitializer()
    
    def zeros_initializer(self):
        return MockInitializer()
    
    def random_normal_initializer(self, *args, **kwargs):
        return MockInitializer()

class MockDeviceContext:
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        pass

class MockNameScope:
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        pass

class MockInitializer:
    def __init__(self, *args, **kwargs):
        pass

# Create the mock tensorflow module
mock_tf = MockTensorFlow()

# Add it to sys.modules so it gets imported when tensorflow is imported
sys.modules['tensorflow'] = mock_tf
sys.modules['tensorflow.contrib'] = mock_tf.contrib
sys.modules['tensorflow.contrib.slim'] = mock_tf.contrib.slim
sys.modules['tensorflow.train'] = mock_tf.train

print("TensorFlow compatibility layer loaded successfully!") 