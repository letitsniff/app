interface Props {
  html: string;
}

export default function Prose({ html }: Props) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
