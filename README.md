# Big fat plan

Track: REVIEW + QA
1. Run your project
2. Observes project via video
3. Run the video through meta v2
4. results go through a prompt x2
5. prompt changes website x2
6. display the changes in a simple 4x grid to the user 



Backend 
- Runs dev server
- Record scrolling 
- Plop scrolling data into tribe
- get response
- Suggest design changes
- make a pr with design changes

## Backend Setup

**Prerequisites**

```bash
brew install ffmpeg
```

**Install dependencies**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
git clone https://github.com/facebookresearch/tribev2 /tmp/tribev2
pip install -e /tmp/tribev2
pip install eval_type_backport "pydantic>=2.10"
playwright install chromium
```

**Environment**

```bash
export OPENAI_API_KEY=sk-...   # required for LLM step
export HF_TOKEN=hf_...         # optional, avoids HuggingFace rate limits
```

**Run**

```bash
uvicorn main:app --reload
```

**Test the pipeline**

```bash
curl -X POST http://localhost:8000/pipeline \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```



Frontend
- Shows the results 


Additional:
- Elevenlabs audio
- White circle