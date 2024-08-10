export default function renderMatrix(nObjects, nFeatures) {
    // Create a render of a matrix of size nObjects x nFeatures, populated with letters of the alphabet
    // When the end of the alphabet is reached, add an extra letter, eg. 'x', 'y', 'z', 'aa', 'ab', ...
    // return a JSX element
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const matrix = [];
    let letterIndex = 0;
    for (let i = 0; i < nObjects; i++) {
        const row = [];
        for (let j = 0; j < nFeatures; j++) {
            row.push(alphabet[letterIndex % 26]);
            letterIndex++;
        }
        matrix.push(row);
    }

    return (
        <table style={{ borderCollapse: 'collapse', margin: 'auto', textAlign: 'center' }}>
            <tbody>
                {matrix.map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td key={j} style={{ border: '1px solid black', padding: '5px' }}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}