import {useState} from 'react';

const calcAverage = numbers => {
    console.log('평균 값 계산 중..');
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a,b) => a+b);
    return sum / numbers.length;
};

const NormalAverage = () => {
  const [list, setList] = useState([]);
  const [number, setNumber] = useState('');

  const onChange = e => {
      setNumber(e.target.value);
  };

  const onInsert = e => {
      const nextList = list.concat(parseInt(number));
      setList(nextList);
      setNumber('');
  };

  return (
    <div>
        <input value={number} onChange={onChange} />
        <button onClick={onInsert}>숫자 등록</button>
        <ul>
            {list.map((value, index) => (
                <li key={index}>{value}</li>
            ))}
        </ul>
        <div>
            <b>평균값:</b> {calcAverage(list)}
        </div>
    </div>
  );
};

export default NormalAverage;