from llama_cpp import Llama
from app.utils.utils import get_model_path

# Load model (adjust path)
llm = Llama(
    model_path= str(get_model_path("MediPhi-Clinical.i1-Q4_K_M.gguf")),
    n_gpu_layers=-1,   
    n_threads=4,
    n_ctx=2048
)

# Chat messages
messages = [
    {"role": "system", "content": "Provide a one-paragraph clinical summary of the doctor-patient conversation."},
    {"role": "user", "content": """
Good morning. What brings you in today?
Morning doctor, I’ve had this nagging cough for about two weeks and it doesn’t seem to be getting better.
I see. Is it dry, or are you bringing up any mucus?
Mostly dry, though sometimes there’s a little bit of clear phlegm.
Any fever, shortness of breath, or chest pain?
No fever. I do feel a little winded if I go up stairs, but no real chest pain.
Got it. Do you smoke or have any history of asthma or allergies?
I don’t smoke. I do have seasonal allergies, but this feels different.
Okay. And have you noticed any triggers that make it worse, like lying down, eating, or being around dust?
It actually gets worse at night when I’m lying in bed.
That’s helpful. Sometimes a cough that lingers at night can be related to acid reflux or postnasal drip. Based on what you’ve told me, this doesn’t sound like pneumonia or anything very serious, but I’d like to listen to your lungs just to be safe.
Sure.
Your lungs sound clear. For now, I recommend trying an over-the-counter antihistamine at night and using extra pillows to keep your head elevated. If things don’t improve in the next week or if you develop fever, worsening shortness of breath, or chest pain, come back right away.
Okay, thanks doctor. I’ll do that.
"""
    }
]

# Run inference
result = llm.create_chat_completion(messages=messages)

# Extract model output
summary = result["choices"][0]["message"]["content"]
print("\n--- SUMMARY ---\n")
print(summary)
print("\n---------------\n")


