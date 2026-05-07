interface BiomarkerOrb {
  id: number;
  size: number;
  top: string;
  left: string;
  delay: string;
}

interface BiomarkerLabel {
  id: number;
  text: string;
  top: string;
  left: string;
  delay: string;
}

export function HeroAnimation() {
  const orbs: BiomarkerOrb[] = [
    { id: 1, size: 40, top: "15%", left: "10%", delay: "0s" },
    { id: 2, size: 25, top: "25%", left: "85%", delay: "1s" },
    { id: 3, size: 35, top: "60%", left: "5%", delay: "2s" },
    { id: 4, size: 20, top: "70%", left: "90%", delay: "0.5s" },
    { id: 5, size: 30, top: "80%", left: "15%", delay: "1.5s" },
    { id: 6, size: 22, top: "40%", left: "92%", delay: "2.5s" },
    { id: 7, size: 18, top: "10%", left: "75%", delay: "3s" },
    { id: 8, size: 28, top: "85%", left: "80%", delay: "0.8s" },
  ];

  const labels: BiomarkerLabel[] = [
    { id: 1, text: "Testosterone", top: "20%", left: "8%", delay: "0.2s" },
    { id: 2, text: "HbA1c", top: "35%", left: "88%", delay: "0.8s" },
    { id: 3, text: "Vitamin D", top: "55%", left: "6%", delay: "1.4s" },
    { id: 4, text: "CRP", top: "75%", left: "85%", delay: "2s" },
    { id: 5, text: "Free T", top: "45%", left: "4%", delay: "2.6s" },
    { id: 6, text: "Insulin", top: "65%", left: "92%", delay: "3.2s" },
  ];

  const dataStreams = [
    { left: "20%", height: "60px", delay: "0s" },
    { left: "35%", height: "80px", delay: "1s" },
    { left: "50%", height: "50px", delay: "2s" },
    { left: "65%", height: "70px", delay: "1.5s" },
    { left: "80%", height: "55px", delay: "0.5s" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="hex-grid" />
      
      <div className="scan-line delay-1000" />
      
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="biomarker-orb"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            animationDelay: orb.delay,
          }}
        />
      ))}
      
      {labels.map((label) => (
        <div
          key={label.id}
          className="biomarker-label hidden lg:block"
          style={{
            top: label.top,
            left: label.left,
            animationDelay: label.delay,
          }}
        >
          {label.text}
        </div>
      ))}
      
      {dataStreams.map((stream, index) => (
        <div
          key={index}
          className="data-stream hidden md:block"
          style={{
            left: stream.left,
            height: stream.height,
            animationDelay: stream.delay,
          }}
        />
      ))}
      
      <div 
        className="pulse-ring hidden md:block"
        style={{ 
          width: 300, 
          height: 300, 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)" 
        }}
      />
      <div 
        className="pulse-ring hidden md:block delay-1000"
        style={{ 
          width: 300, 
          height: 300, 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)" 
        }}
      />
      <div 
        className="pulse-ring hidden md:block delay-2000"
        style={{ 
          width: 300, 
          height: 300, 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)" 
        }}
      />
    </div>
  );
}

export function EnergyCoreAnimation() {
  return (
    <div className="energy-core">
      <div className="relative z-10">
        <div className="absolute -inset-4 bg-brand-red/10 blur-2xl rounded-full" />
      </div>
    </div>
  );
}
