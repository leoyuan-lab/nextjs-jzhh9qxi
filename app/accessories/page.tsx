import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { AccessoriesHub } from './AccessoriesHub';

export default async function AccessoriesPage() {
  const lang = await getSiteLang();
  const base = getMessages(lang).pages.accessories;
  const copy = {
    swipeHint: base.swipeHint,
    expandSpecs: base.expandSpecs,
    inquiry: base.inquiry,
    lanes: base.lanes,
  };

  return (
    <>
      <div className="accessories-hub-intro">
        <h1>{base.introTitle}</h1>
        <p>{base.introBody}</p>
      </div>
      <AccessoriesHub copy={copy} />
    </>
  );
}
