const HeroSteps = () => {
  const steps = [
    {
      number: 1,
      title: "Upload",
      description: "Add a book file to get started",
    },
    {
      number: 2,
      title: "Chat",
      description: "Ask questions using voice or text",
    },
    {
      number: 3,
      title: "Learn",
      description: "Get insights from interactive conversations",
    },
  ];

  return (
    <div className="library-steps-card hidden lg:block flex-1 max-w-xs">
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="library-step-item">
            <div className="library-step-number">{step.number}</div>
            <div className="pt-1">
              <div className="library-step-title">{step.title}</div>
              <p className="library-step-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSteps;
