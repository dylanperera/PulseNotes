from abc import ABC, abstractmethod

### This class represents the base class from which we will create adapters
### The adapters will be different ways to communicate with models, such as:
    ### llama.cpp-python, OpenAI (if we want to allow for online access), anthropic, RemoteInferenceAdapter (wraps hospital REST server), etc.,
class ModelInterface(ABC):

    @abstractmethod
    def generateSummary(self, prompt: str, input: str):
        pass

    # If in the future we want to add a "Diagnosis helper" method we would add that over here