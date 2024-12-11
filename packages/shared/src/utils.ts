import { formatBlockUri, parseBlockUri } from "@kblocks/api";

export function parseRef(ref: string, referencingObjectUri: string) {
  const sanitizedRef = ref.replace("${ref://", "").replace("}", "");
  const { version, system, namespace } = parseBlockUri(referencingObjectUri);
  const [pluralAndGroup, name, attribute] = sanitizedRef.split("/");
  const [plural, group] = pluralAndGroup!.split(/\.(.+)/);
  const uri = formatBlockUri({
    group: group!,
    version,
    plural: plural!,
    system: system,
    namespace: namespace,
    name: name!,
  });
  return { objUri: uri, attribute: attribute!.split("?")[0] };
}
