import React from 'react'; // This line is crucial for JSX to work
import { useState, useEffect } from 'react';

// Icons from Lucide React
const Sparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2" /><path d="M12 20v2" /><path d="M20 12h2" /><path d="M2 12h2" /><path d="m18 18-1.4-1.4" /><path d="m6.4 6.4-1.4-1.4" /><path d="m18 6.4-1.4 1.4" /><path d="m6.4 17.6-1.4 1.4" />
  </svg>
);
const Copy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);
const RefreshCcw = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
  </svg>
);
const Sun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M20 12h2" /><path d="M2 12h2" /><path d="m18.36 5.64-1.42 1.42" /><path d="m6.05 17.95-1.42 1.42" /><path d="m5.64 5.64 1.42 1.42" /><path d="m17.95 18.36 1.42 1.42" />
  </svg>
);
const Moon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);


const App = () => {
  // State for different parts of the prompt
  const [persona, setPersona] = useState('');
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [examples, setExamples] = useState('');
  const [format, setFormat] = useState('');
  const [constraints, setConstraints] = useState('');

  // State for the generated prompt and loading status
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or default to false
    const savedMode = localStorage.getItem('isDarkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // State for "Idea to Prompt" feature
  const [promptIdea, setPromptIdea] = useState('');
  const [isPopulatingFromIdea, setIsPopulatingFromIdea] = useState(false);
  const [ideaError, setIdeaError] = useState('');


  // Effect to apply dark mode class to body and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Function to generate the prompt using the LLM
  const generatePrompt = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedPrompt('');

    // Construct the prompt for the LLM based on user inputs
    const userPrompt = `
      You are an expert prompt engineer. Your task is to create a highly effective and well-structured prompt for a large language model, following best practices.
      Consider the following elements provided by the user:

      ${persona ? `Persona: ${persona}` : ''}
      ${task ? `Task: ${task}` : ''}
      ${context ? `Context: ${context}` : ''}
      ${examples ? `Examples (if any, provide them clearly): ${examples}` : ''}
      ${format ? `Desired Output Format: ${format}` : ''}
      ${constraints ? `Constraints/Guardrails: ${constraints}` : ''}

      Combine these elements into a single, clear, concise, and powerful prompt.
      Ensure the prompt is actionable and leaves no room for ambiguity.
      Start the generated prompt with "You are a helpful assistant." or a suitable persona if provided.
      Do not include any conversational text outside of the prompt itself.
    `.trim();

    try {
      // LLM API call
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: userPrompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this if empty
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        setGeneratedPrompt(result.candidates[0].content.parts[0].text);
      } else {
        setError('Failed to generate prompt. Please try again.');
        console.error('LLM response structure unexpected:', result);
      }
    } catch (err) {
      setError('An error occurred while generating the prompt. Please check your network connection and try again.');
      console.error('Error during LLM API call:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy the generated prompt to clipboard
  const copyToClipboard = () => {
    if (generatedPrompt) {
      const textarea = document.createElement('textarea');
      textarea.value = generatedPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy'); // Fallback for navigator.clipboard.writeText()
      document.body.removeChild(textarea);

      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000); // Hide message after 2 seconds
    }
  };

  // Function to reset all input fields and generated prompt
  const resetForm = () => {
    setPersona('');
    setTask('');
    setContext('');
    setExamples('');
    setFormat('');
    setConstraints('');
    setGeneratedPrompt('');
    setError('');
    setIdeaError('');
    setPromptIdea('');
    setIsLoading(false);
    setIsPopulatingFromIdea(false);
  };

  // Function to populate fields with sample data
  const populateWithMagicData = () => {
    setPersona('You are a highly creative content writer specializing in science fiction.');
    setTask('Write a short story about the discovery of a new alien civilization.');
    setContext('The story should be set on a newly discovered exoplanet, Kepler-186f, and focus on the initial contact.');
    setExamples('Input: "Describe the alien life form." Output: "The creature was bioluminescent, with multiple limbs and a crystalline exoskeleton."');
    setFormat('The story should be exactly 5 paragraphs long, with each paragraph focusing on a different aspect of the discovery (approach, landing, first contact, communication attempt, implications).');
    setConstraints('Avoid any violent encounters. The tone should be one of wonder and scientific curiosity. Do not exceed 500 words.');
    setGeneratedPrompt(''); // Clear any previously generated prompt
    setError('');
    setIdeaError('');
    setPromptIdea('');
  };

  // Function to populate sections from a simple prompt idea using LLM
  const populateFromIdea = async () => {
    setIsPopulatingFromIdea(true);
    setIdeaError('');
    setError(''); // Clear any previous errors
    setGeneratedPrompt(''); // Clear generated prompt

    if (!promptIdea.trim()) {
      setIdeaError('Please enter a prompt idea.');
      setIsPopulatingFromIdea(false);
      return;
    }

    const ideaPrompt = `
      You are an expert prompt engineer. A user will provide a simple idea for a prompt. Your task is to break down this idea into the following components: persona, task, context, examples, format, and constraints. Provide the output in a JSON object with these keys. If a component is not explicitly mentioned or implied, leave its value as an empty string. For 'examples', provide a brief illustrative example if possible, otherwise an empty string.

      User Idea: ${promptIdea}
    `.trim();

    const payload = {
      contents: [{ role: "user", parts: [{ text: ideaPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "persona": { "type": "STRING" },
            "task": { "type": "STRING" },
            "context": { "type": "STRING" },
            "examples": { "type": "STRING" },
            "format": { "type": "STRING" },
            "constraints": { "type": "STRING" }
          },
          "propertyOrdering": ["persona", "task", "context", "examples", "format", "constraints"]
        }
      }
    };

    const apiKey = ""; // Canvas will provide this if empty
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);

        setPersona(parsedJson.persona || '');
        setTask(parsedJson.task || '');
        setContext(parsedJson.context || '');
        setExamples(parsedJson.examples || '');
        setFormat(parsedJson.format || '');
        setConstraints(parsedJson.constraints || '');
      } else {
        setIdeaError('Failed to parse idea into sections. Please try a different idea or fill manually.');
        console.error('LLM response structure unexpected for idea parsing:', result);
      }
    } catch (err) {
      setIdeaError('An error occurred while processing your idea. Please try again.');
      console.error('Error during LLM API call for idea parsing:', err);
    } finally {
      setIsPopulatingFromIdea(false);
    }
  };


  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'} p-4 sm:p-8 font-sans flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-4xl ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-200'} rounded-xl shadow-2xl p-6 sm:p-10 border relative`}>
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-300
            ${isDarkMode ? 'bg-gray-600 text-yellow-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            shadow-md transform hover:scale-110`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <h1 className={`text-4xl font-extrabold text-center ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'} mb-8 tracking-tight`}>
          <Sparkles className="inline-block mr-3 text-yellow-500" size={32} />
          Prompt Wizard
        </h1>

        <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-10 text-lg leading-relaxed`}>
          Craft powerful prompts for large language models. Fill in the sections below to guide the AI.
        </p>

        {/* Idea to Prompt Section */}
        <div className={`mb-8 p-5 rounded-lg shadow-inner ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <label htmlFor="promptIdea" className={`block text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>
            Idea to Prompt
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              id="promptIdea"
              className={`flex-grow p-3 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[60px]
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500' : 'bg-white border-blue-300 text-gray-800 focus:ring-blue-400'}`}
              rows="2"
              placeholder="e.g., 'Write a poem about nature in haiku format.'"
              value={promptIdea}
              onChange={(e) => setPromptIdea(e.target.value)}
            ></textarea>
            <button
              onClick={populateFromIdea}
              className={`flex-shrink-0 flex items-center justify-center px-6 py-2 rounded-full text-lg font-bold transition duration-300 ease-in-out
                ${isPopulatingFromIdea ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white shadow-lg transform hover:scale-105'}`}
              disabled={isPopulatingFromIdea || !promptIdea.trim()}
            >
              {isPopulatingFromIdea ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Populating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" /> Populate Sections
                </>
              )}
            </button>
          </div>
          {ideaError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{ideaError}</span>
            </div>
          )}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Persona Input */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'} p-5 rounded-lg shadow-sm border`}>
            <label htmlFor="persona" className={`block text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>
              Persona <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-normal`}>(Optional)</span>
            </label>
            <textarea
              id="persona"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[80px]
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500' : 'bg-white border-blue-300 text-gray-800 focus:ring-blue-400'}`}
              rows="3"
              placeholder="e.g., 'You are a helpful customer service agent.' or 'Act as a senior software engineer.'"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            ></textarea>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>Define the role or character the AI should adopt.</p>
          </div>

          {/* Task Input */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-100'} p-5 rounded-lg shadow-sm border`}>
            <label htmlFor="task" className={`block text-lg font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-700'} mb-2`}>
              Task <span className="text-red-500">*</span>
            </label>
            <textarea
              id="task"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[80px]
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-green-500' : 'bg-white border-green-300 text-gray-800 focus:ring-green-400'}`}
              rows="3"
              placeholder="e.g., 'Summarize the following article.' or 'Generate a creative story about a space explorer.'"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            ></textarea>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>Clearly state what you want the AI to do.</p>
          </div>

          {/* Context Input */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-100'} p-5 rounded-lg shadow-sm border`}>
            <label htmlFor="context" className={`block text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} mb-2`}>
              Context <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-normal`}>(Optional)</span>
            </label>
            <textarea
              id="context"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[80px]
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-purple-300 text-gray-800 focus:ring-purple-400'}`}
              rows="3"
              placeholder="e.g., 'The article is about renewable energy sources.' or 'The story should be set in a dystopian future.'"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            ></textarea>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>Provide any background information or relevant details.</p>
          </div>

          {/* Examples Input */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-100'} p-5 rounded-lg shadow-sm border`}>
            <label htmlFor="examples" className={`block text-lg font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'} mb-2`}>
              Examples <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-normal`}>(Optional)</span>
            </label>
            <textarea
              id="examples"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[80px]
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-yellow-500' : 'bg-white border-yellow-300 text-gray-800 focus:ring-yellow-400'}`}
              rows="3"
              placeholder="e.g., 'Input: 'Hello' Output: 'Hi there!''"
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
            ></textarea>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>Provide few-shot examples to guide the AI's output style.</p>
          </div>

          {/* Format Input */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-red-50 border-red-100'} p-5 rounded-lg shadow-sm border`}>
            <label htmlFor="format" className={`block text-lg font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'} mb-2`}>
              Output Format <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-normal`}>(Optional)</span>
            </label>
            <textarea
              id="format"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[80px]
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-red-500' : 'bg-white border-red-300 text-gray-800 focus:ring-red-400'}`}
              rows="3"
              placeholder="e.g., 'JSON format with keys: title, summary, keywords.' or 'Bullet points.'"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            ></textarea>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>Specify how you want the AI's response to be structured.</p>
          </div>

          {/* Constraints Input */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-teal-50 border-teal-100'} p-5 rounded-lg shadow-sm border`}>
            <label htmlFor="constraints" className={`block text-lg font-semibold ${isDarkMode ? 'text-teal-300' : 'text-teal-700'} mb-2`}>
              Constraints/Guardrails <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-normal`}>(Optional)</span>
            </label>
            <textarea
              id="constraints"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 ease-in-out resize-y min-h-[80px]
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-500' : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-400'}`}
              rows="3"
              placeholder="e.g., 'Response should be under 100 words.' or 'Do not use offensive language.'"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            ></textarea>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>Set any limitations or rules for the AI's behavior.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={generatePrompt}
            className={`flex items-center justify-center px-8 py-3 rounded-full text-lg font-bold transition duration-300 ease-in-out
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105'}`}
            disabled={isLoading || !task}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" /> Generate Prompt
              </>
            )}
          </button>
          <button
            onClick={populateWithMagicData}
            className={`flex items-center justify-center px-8 py-3 rounded-full text-lg font-bold shadow-md transition duration-300 ease-in-out transform hover:scale-105
              ${isDarkMode ? 'text-purple-300 bg-purple-800 hover:bg-purple-700' : 'text-purple-700 bg-purple-200 hover:bg-purple-300'}`}
          >
            <Sparkles className="mr-2" /> Magic Fill
          </button>
          <button
            onClick={resetForm}
            className={`flex items-center justify-center px-8 py-3 rounded-full text-lg font-bold shadow-md transition duration-300 ease-in-out transform hover:scale-105
              ${isDarkMode ? 'text-gray-300 bg-gray-600 hover:bg-gray-500' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
          >
            <RefreshCcw className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Generated Prompt Display */}
        {generatedPrompt && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} p-6 rounded-lg shadow-inner border relative`}>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-4 flex items-center`}>
              <Sparkles className="inline-block mr-2 text-yellow-500" /> Your Generated Prompt:
            </h2>
            <pre className={`whitespace-pre-wrap break-words p-4 rounded-md text-base leading-relaxed border
              ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300 text-gray-800'}`}>
              {generatedPrompt}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition duration-200 ease-in-out transform hover:scale-110"
              title="Copy to Clipboard"
            >
              <Copy size={20} />
            </button>
            {showCopiedMessage && (
              <span className="absolute top-16 right-4 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md shadow-sm animate-fade-in-out">
                Copied!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;