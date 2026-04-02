import ProgressRing from './ProgressRing';

const TimerCircle = ({ totalSeconds, remainingSeconds, label }) => {
  const progress = totalSeconds > 0
    ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)
    : 0;
  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const ss = String(remainingSeconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-3">
      <ProgressRing percentage={progress} size={270} strokeWidth={12} color="#3B82F6">
        <div className="text-center">
          <p className="text-5xl md:text-6xl font-bold text-white tracking-wide">{mm}:{ss}</p>
          <p className="text-sm text-gray-400 mt-1 uppercase">{label}</p>
        </div>
      </ProgressRing>
    </div>
  );
};

export default TimerCircle;

