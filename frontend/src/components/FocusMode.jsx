import { Minimize2, Volume2, VolumeX } from 'lucide-react';
import TimerCircle from './TimerCircle';

const FocusMode = ({
  onClose,
  soundEnabled,
  onToggleSound,
  totalSeconds,
  remainingSeconds,
  label
}) => {
  return (
    <div className="fixed inset-0 z-[70] bg-dark-bg/95 backdrop-blur flex flex-col">
      <div className="p-5 flex items-center justify-between">
        <h3 className="text-white font-semibold">Focus Mode</h3>
        <div className="flex items-center gap-2">
          <button onClick={onToggleSound} className="btn-secondary p-2">
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={onClose} className="btn-secondary p-2">
            <Minimize2 size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <TimerCircle
          totalSeconds={totalSeconds}
          remainingSeconds={remainingSeconds}
          label={label}
        />
      </div>
    </div>
  );
};

export default FocusMode;

