import { useParams } from 'react-router-dom';

const ViewText = () => {
    const { id } = useParams();
    const storedText = localStorage.getItem(id || '');

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-2xl w-full bg-gray-900 p-6 rounded border border-neon shadow-lg">
                {storedText ? (
                    <pre className="whitespace-pre-wrap text-neon">{storedText}</pre>
                ) : (
                    <p className="text-red-500">Текст не знайдено або посилання недійсне.</p>
                )}
            </div>
        </div>
    );
};

export default ViewText;
