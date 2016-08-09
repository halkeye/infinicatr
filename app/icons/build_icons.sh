for size in $(cat ../manifest.webapp | jq --raw-output '.icons | keys | .[]' | xargs); do
  gm convert icon.svg -resize ${size}x${size} icon-${size}.png;
done
