interface LibraryItemProps {
  name: string;
  version: string;
  license: string;
}

export function LibraryItem({ name, version, license }: LibraryItemProps) {
  return (
    <div className="library-item">
      <div className="library-name">{name}</div>
      <div className="library-meta">
        <span className="library-version">v{version}</span>
        <span className="library-license">{license}</span>
      </div>
    </div>
  );
}
