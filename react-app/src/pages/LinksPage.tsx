import { useState, useEffect } from "react";
import type { LinkGroup } from "../types";
import { usePageTitle } from "../hooks/usePageTitle";
import ContentWithAside from "../components/ContentWithAside";
import PageBanner from "../components/PageBanner";

let _cache: LinkGroup[] | null = null;

export default function LinksPage() {
  usePageTitle("Links");
  const [groups, setGroups] = useState<LinkGroup[]>(_cache ?? []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetch("/content/links.json")
      .then(r => r.json())
      .then((data: LinkGroup[]) => {
        _cache = data;
        setGroups(data);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageBanner title="Links" subtitle="友情連結" />
      <ContentWithAside>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : (
          <div className="space-y-8">
            {groups.map(group => (
              <section key={group.class_name}>
                <h2
                  className="text-lg font-semibold mb-1 text-zinc-700 dark:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: group.class_name }}
                />
                {group.class_desc && (
                  <p
                    className="text-sm text-zinc-400 dark:text-zinc-500 mb-4 italic"
                    dangerouslySetInnerHTML={{ __html: group.class_desc }}
                  />
                )}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {group.link_list.map(link => (
                    <a
                      key={link.link}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all text-center group"
                    >
                      {link.avatar && (
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          <img
                            src={link.avatar}
                            alt={link.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = "/img/MyAvatar.jpg"; }}
                          />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{link.name}</p>
                      {link.descr && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">{link.descr}</p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </ContentWithAside>
    </>
  );
}
