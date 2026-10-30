import { useStrings } from '../i18n/use-strings';
import { useAppStore } from '../state/app-store';

// Sidebar footer when a new version is downloaded (D42): the version and a button to restart into it.
// Without the click, the update installs the next time the app closes.
export function UpdateNotice() {
  const version = useAppStore((state) => state.updateVersion);
  const restartToUpdate = useAppStore((state) => state.restartToUpdate);
  const s = useStrings();
  if (!version) return null;

  return (
    <div className="update-notice" role="status">
      <span className="update-notice-text">{s.updateReady(version)}</span>
      <button type="button" className="update-notice-button" onClick={() => void restartToUpdate()}>
        {s.restart}
      </button>
    </div>
  );
}
