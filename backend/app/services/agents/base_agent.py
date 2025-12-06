from abc import ABC, abstractmethod

from ...models.summarizer.adapters.base_llm_interface import ModelInterface


### Base Agent class/interface which other types of agents (summarization, diagnostic, etc.,) will inherit from
class Agent(ABC):

    def __init__(self):
        super().__init__()

    # Unique Agent ID ("summarization", "diagnostic", etc.,)
    def id(self) -> str:
        pass

    # Get name of model being used
    @property
    @abstractmethod
    def service_provider(self) -> ModelInterface:
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

    # Provider (LlamaCpp, Ollama, OpenAI, etc.,)
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass
    
    # Get name of model being used
    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    # Optional default loading message when processing/completing tasks
    @property
    def loading_message(self) -> str:
        return "Loading"