import { useTranslation } from 'react-i18next';
import { LibraryItem } from './LibraryItem';

export function LibrariesContent() {
  const { t } = useTranslation();
  const libraries = t('settings.libraryList', { returnObjects: true }) as Array<{
    name: string;
    version: string;
    license: string;
  }>;

  return (
    <div className="libraries-list">
      {libraries.map((lib, idx) => (
        <LibraryItem key={idx} name={lib.name} version={lib.version} license={lib.license} />
      ))}
    </div>
  );
}
