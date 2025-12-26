from abc import ABC, abstractmethod

### Base Agent class/interface which other types of agents (summarization, diagnostic, etc.,) will inherit from
class Agent(ABC):

    def __init__(self):
        super().__init__()

    # Unique Agent ID ("summarization", "diagnostic", etc.,)
    @property
    @abstractmethod
    def id(self) -> str:
        pass
    
    # Name of Agent
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    # Short description of Agent
    @property
    @abstractmethod
    def short_description(self) -> str:
        pass
    
    # Long description of Agent
    @property
    @abstractmethod
    def description(self) -> str:
        pass


    # Optional default loading message when processing/completing tasks
    @property
    def loading_message(self) -> str:
        return "Loading"