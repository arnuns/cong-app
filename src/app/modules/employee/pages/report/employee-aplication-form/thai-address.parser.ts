export interface ThaiAddressParts {
  houseNumber: string;
  moo: string;
  soi: string;
  road: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export function parseThaiAddress(value: string): ThaiAddressParts {
  const result: ThaiAddressParts = {
    houseNumber: '',
    moo: '',
    soi: '',
    road: '',
    subDistrict: '',
    district: '',
    province: '',
    postalCode: ''
  };

  let address = (value || '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!address) {
    return result;
  }

  const postalCodeMatch = address.match(/(?:^|\s)(\d{5})$/);
  if (postalCodeMatch) {
    result.postalCode = postalCodeMatch[1];
    address = address.substring(0, postalCodeMatch.index).trim();
  }

  const markerPattern = new RegExp(
    '(^|\\s)' +
    '(กรุงเทพมหานคร|กทม\\.?|หมู่ที่|หมู่(?=\\s|[0-9๐-๙])|' +
    'ม\\.|ซอย|ซ\\.|ถนน|ถ\\.|' +
    'ตำบล|ต\\.|แขวง|อำเภอ|อ\\.|เขต|จังหวัด|จ\\.)\\s*',
    'g'
  );
  const markers: Array<{ marker: string; start: number; valueStart: number }> = [];
  let markerMatch: RegExpExecArray;

  while ((markerMatch = markerPattern.exec(address)) !== null) {
    markers.push({
      marker: markerMatch[2],
      start: markerMatch.index,
      valueStart: markerPattern.lastIndex
    });
  }

  if (markers.length === 0) {
    result.houseNumber = address;
    return result;
  }

  result.houseNumber = address.substring(0, markers[0].start).trim();

  markers.forEach((match, index) => {
    const nextMarker = markers[index + 1];
    const valueEnd = nextMarker ? nextMarker.start : address.length;
    const segmentValue = address.substring(match.valueStart, valueEnd).trim();

    switch (match.marker) {
      case 'หมู่ที่':
      case 'หมู่':
      case 'ม.':
        result.moo = segmentValue;
        break;
      case 'ซอย':
      case 'ซ.':
        result.soi = segmentValue;
        break;
      case 'ถนน':
      case 'ถ.':
        result.road = segmentValue;
        break;
      case 'ตำบล':
      case 'ต.':
      case 'แขวง':
        result.subDistrict = segmentValue;
        break;
      case 'อำเภอ':
      case 'อ.':
      case 'เขต':
        result.district = segmentValue;
        break;
      case 'กรุงเทพมหานคร':
      case 'กทม':
      case 'กทม.':
        result.province = 'กรุงเทพมหานคร';
        break;
      case 'จังหวัด':
      case 'จ.':
        result.province = segmentValue;
        break;
    }
  });

  return result;
}
