import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { Language } from '../domain/language';
import type { Theme } from '../domain/theme';
import { useDismiss } from '../hooks/use-dismiss';
import { LANGUAGE_NAMES, type Strings } from '../i18n/strings';
import { useStrings } from '../i18n/use-strings';
import { openExternal } from '../services/shell';
import { useAppStore } from '../state/app-store';
import {
  AcrylicIcon,
  CheckIcon,
  ChevronRightIcon,
  FlagBrazilIcon,
  FlagUsIcon,
  GlobeIcon,
  MonitorIcon,
  MoonIcon,
  NewNoteIcon,
  SpellcheckIcon,
  SunIcon,
} from './icons';

type OptionsMenuProps = {
  /** The "Mais opções" button: positions the menu and toggles it. */
  anchor: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

type SectionName = 'theme' | 'language';
/** `focus`: opened from the keyboard, so the focus moves to the current option. */
type OpenSection = { name: SectionName; focus: boolean } | null;

type Option<T extends string> = { value: T; label: string; icon: ReactNode };

const SHORTCUTS: { label: keyof Strings; keys: string[] }[] = [
  { label: 'newNote', keys: ['Ctrl', 'T'] },
  { label: 'toggleSidebar', keys: ['Ctrl', '\\'] },
];

const THEME_ICONS: Record<Theme, () => ReactNode> = { system: MonitorIcon, light: SunIcon, dark: MoonIcon };
const LANGUAGE_ICONS: Record<Language, () => ReactNode> = { system: MonitorIcon, pt: FlagBrazilIcon, en: FlagUsIcon };

function themeName(theme: Theme, s: Strings): string {
  return { system: s.system, light: s.themeLight, dark: s.themeDark }[theme];
}

function languageName(language: Language, s: Strings): string {
  return language === 'system' ? s.system : LANGUAGE_NAMES[language];
}

/** Rows the arrow keys move between, the options of an open section included, in screen order. */
function menuItems(menu: HTMLElement | null): HTMLElement[] {
  // Closed sections stay in the page (inert) while they animate out.
  return Array.from(menu?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? []).filter(
    (item) => !item.closest('[inert]'),
  );
}

// Screen: docs/design/screens/menu-options.html. Switches apply at once and are saved.
// Tema and Idioma expand their options right below the row (D39, D41); the shortcuts sit in a footer.
export function OptionsMenu({ anchor, onClose }: OptionsMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const layout = useAppStore((state) => state.layout);
  const setLayoutOption = useAppStore((state) => state.setLayoutOption);
  const spellcheck = useAppStore((state) => state.spellcheck);
  const setSpellcheck = useAppStore((state) => state.setSpellcheck);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const acrylic = useAppStore((state) => state.acrylic);
  const setAcrylic = useAppStore((state) => state.setAcrylic);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const s = useStrings();
  const [right, setRight] = useState(0);
  const [section, setSection] = useState<OpenSection>(null);
  // Read by the app before the menu opens, so the acrylic warning is there from the first frame.
  const transparency = useAppStore((state) => state.transparencyEnabled);
  useDismiss(ref, onClose, [anchor]);

  // Right-aligned with the button.
  useLayoutEffect(() => {
    const rect = anchor.current?.getBoundingClientRect();
    // Whole pixels, so the menu ends its opening animation sharp, without a half-pixel shift.
    if (rect) setRight(Math.round(window.innerWidth - rect.right));
  }, [anchor]);

  // Opens with the focus on the first row, so the arrow keys work right away.
  useEffect(() => {
    menuItems(ref.current)[0]?.focus();
  }, []);

  const top = Math.round((anchor.current?.getBoundingClientRect().bottom ?? 48) + 7);
  // Hangs from the button, so it can only grow down to 8 px above the window bottom; then it scrolls.
  const maxHeight = window.innerHeight - top - 8;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = menuItems(ref.current);
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next: number | null = null;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'Enter' && document.activeElement instanceof HTMLInputElement) {
      // Space toggles a switch natively; Enter does the same here, like on the other rows.
      event.preventDefault();
      document.activeElement.click();
      return;
    } else return;
    event.preventDefault();
    items[next]?.focus();
  };

  const sectionProps = (name: SectionName) => ({
    open: section?.name === name,
    focus: section?.name === name && section.focus,
    onOpen: (focus: boolean) => setSection({ name, focus }),
    onClose: () => setSection(null),
  });

  return (
    <div
      ref={ref}
      className="menu options-menu"
      role="menu"
      aria-label={s.options}
      style={{ top, right, maxHeight }}
      onKeyDown={onKeyDown}
    >
      <div className="menu-section-label">{s.general}</div>
      <ExpandableItem
        {...sectionProps('language')}
        icon={<GlobeIcon />}
        label={s.language}
        value={languageName(language, s)}
        system={{ value: 'system', label: s.system, icon: <MonitorIcon /> }}
        options={(['pt', 'en'] as const).map((value) => ({
          value,
          label: LANGUAGE_NAMES[value],
          icon: LANGUAGE_ICONS[value](),
        }))}
        selected={language}
        onSelect={setLanguage}
      />
      <Switch icon={<SpellcheckIcon />} label={s.spellcheck} checked={spellcheck} onChange={setSpellcheck} />

      <div className="menu-separator" role="separator" />

      <div className="menu-section-label">{s.appearance}</div>
      <ExpandableItem
        {...sectionProps('theme')}
        icon={THEME_ICONS[theme]()}
        label={s.theme}
        value={themeName(theme, s)}
        system={{ value: 'system', label: s.system, icon: <MonitorIcon /> }}
        options={(['light', 'dark'] as const).map((value) => ({
          value,
          label: themeName(value, s),
          icon: THEME_ICONS[value](),
        }))}
        selected={theme}
        onSelect={setTheme}
      />
      <Switch
        icon={<AcrylicIcon />}
        label={s.acrylic}
        checked={acrylic}
        onChange={setAcrylic}
        warning={
          acrylic && !transparency ? (
            <button
              type="button"
              className="menu-warning"
              onClick={(event) => {
                // Only the link: the switch must not toggle with it.
                event.preventDefault();
                void openExternal('ms-settings:colors');
              }}
            >
              {s.acrylicNeedsTransparency}
            </button>
          ) : null
        }
      />

      <div className="menu-separator" role="separator" />

      <div className="menu-section-label">{s.layout}</div>
      <Switch
        icon={<NewNoteIcon />}
        label={s.showNewNoteButton}
        checked={layout.showNewNoteButton}
        onChange={(checked) => setLayoutOption('showNewNoteButton', checked)}
      />

      <div className="menu-footer">
        <div className="menu-section-label">{s.shortcuts}</div>
        {SHORTCUTS.map(({ label, keys }) => (
          <div key={label} className="menu-shortcut">
            <span>{s[label] as string}</span>
            <span className="menu-shortcut-keys">
              {keys.map((key) => (
                <kbd key={key}>{key}</kbd>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type ExpandableItemProps<T extends string> = {
  icon: ReactNode;
  label: string;
  /** The current option, shown on the right of the row. */
  value: string;
  open: boolean;
  focus: boolean;
  onOpen: (focus: boolean) => void;
  onClose: () => void;
  /** "Sistema", first, before the real options. */
  system: Option<T>;
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

/** A row whose options open right below it, inside the menu; the rest of the menu moves down. */
function ExpandableItem<T extends string>({
  icon,
  label,
  value,
  open,
  focus,
  onOpen,
  onClose,
  system,
  options,
  selected,
  onSelect,
}: ExpandableItemProps<T>) {
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  // Opened from the keyboard: the focus goes to the current option.
  useLayoutEffect(() => {
    if (open && focus) list.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
  }, [open, focus]);

  const close = () => {
    onClose();
    trigger.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight' && !open) onOpen(true);
    else if (event.key === 'ArrowLeft' && open) onClose();
    else return;
    event.preventDefault();
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' && event.key !== 'ArrowLeft') return;
    // Esc closes only this section, so it must not reach the menu's own Esc handling.
    event.preventDefault();
    event.stopPropagation();
    close();
  };

  const optionButton = (option: Option<T>) => (
    <button
      key={option.value}
      type="button"
      className="menu-item"
      role="menuitemradio"
      aria-checked={option.value === selected}
      data-menu-item
      onClick={() => {
        onSelect(option.value);
        close();
      }}
    >
      {option.icon}
      <span className="menu-item-label">{option.label}</span>
      {option.value === selected && <CheckIcon />}
    </button>
  );

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="menu-cycle"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${value}`}
        data-menu-item
        onClick={() => (open ? onClose() : onOpen(false))}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="menu-row-label">
          {icon}
          {label}
        </span>
        <span className="menu-cycle-value">
          {value}
          <ChevronRightIcon />
        </span>
      </button>
      {/* Always there, so closing can animate too; hidden and inert while closed. */}
      <div
        ref={list}
        className="menu-subitems"
        role="menu"
        aria-label={label}
        hidden={!open}
        inert={!open}
        onKeyDown={onListKeyDown}
      >
        {optionButton(system)}
        {options.map(optionButton)}
      </div>
    </>
  );
}

function Switch({
  icon,
  label,
  checked,
  onChange,
  warning,
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** A line under the label, when the setting doesn't take effect. */
  warning?: ReactNode;
}) {
  // Tied to the input: a label without it acts on its first control, which would be the warning link.
  const id = useId();
  return (
    <label className="menu-switch" htmlFor={id}>
      <span className="menu-row-label">
        {icon}
        <span className="menu-row-text">
          {label}
          {warning}
        </span>
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        data-menu-item
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="menu-switch-track" aria-hidden="true" />
    </label>
  );
}
