export default function Demo() {
    return (
        <>
            <div>Demo</div>
            <button
                onClick={() => {
                    throw new Error("Sentry test error from client");
                }}
            >
                Trigger Sentry Error
            </button>
        </>
    )
}