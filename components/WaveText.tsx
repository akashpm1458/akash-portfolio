import { Fragment } from "react";

/** Rolling-text hover: each word slides up and is replaced by a copy of itself. */
export function WaveText({ children }: { children: string }) {
  const words = children.split(" ");
  return (
    <span className="wave-text">
      <span className="sr-only">{children}</span>
      <span className="wave-words" aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className="wave-window">
              <span className="wave-glyph" data-char={w}>{w}</span>
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}

/** Rolling icon: two stacked copies, the track slides up 50% on hover. */
export function WaveIcon({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <span className="wave-icon" aria-hidden="true" style={{ ["--wave-icon-size" as string]: `${size}px` }}>
      <span className="wave-icon-track">
        <span>{children}</span>
        <span>{children}</span>
      </span>
    </span>
  );
}
