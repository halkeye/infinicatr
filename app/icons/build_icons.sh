ABSOLUTE_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for size in $(jq '.icons | .[] | .sizes' --raw-output < $ABSOLUTE_PATH/../manifest.json | xargs); do
  gm convert $ABSOLUTE_PATH/icon.svg -resize ${size} $ABSOLUTE_PATH/icon-$(echo $size | awk -Fx '{ print $1}').png;
done
