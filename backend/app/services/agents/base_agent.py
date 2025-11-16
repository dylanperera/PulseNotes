from abc import ABC, abstractmethod
from ...models.llm.base_llm_interface import ModelInterface

### Base Agent class/interface which other types of agents (summarization, diagnostic, etc.,) will inherit from
class Agent(ABC):

    def __init__(self):
        pass
    
    # Name of Agent
    @property
    @abstractmethod
    def name(self):
        pass

    # Short description of Agent
    @property
    @abstractmethod
    def short_description(self):
        pass
    
    # Long description of Agent
    @property
    @abstractmethod
    def description(self):
        pass

    # Need to add a field to store the ModelService object that would be passed
    
    
    # Get name of model being used
    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    # Optional default loading message when processing/completing tasks
    @property
    def loading_message(self):
        return "Loading"