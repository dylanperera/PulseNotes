from .agents.summarization_agent import SummarizationAgent


class SummarizationService():

    # In the constructor we'd create the agent object passing the provider and model names
    # Need to instantiate/create the ModelInterface itself here
    def __init__(self, provider_name, model_name):
        self.summarization_agent = SummarizationAgent(provider_name, model_name)

    # Have a private method to distill/edit the incoming transcript - this would be like different slicing methods, etc., 
    def _format_input(self, input):
        pass

    # Have a private method to format the output
    def _format_output(self, input):
        pass

    # Have a method to generate the summary, by calling the agent.summarize
    def generate_streamed_summary(self, input):

        formatted_input = self._format_input(input)
        result = self.summarization_agent.generate_streamed_summary(formatted_input)
        output = self._format_output(result)

        return output

    