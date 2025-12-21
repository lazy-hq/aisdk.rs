export const googleGenerateText = `
use aisdk::{
    core::LanguageModelRequest,
    providers::google::Google,
};

#[tokio::main]
async fn main() {

    let result = LanguageModelRequest::builder()
        .model(Google::gemini_3_flash_preview())
        .prompt("What is the meaning of life?")
        .build()
        .generate_text() // stream_text() for streaming
        .await
        .unwrap();

    println!("{}", result.text().unwrap());
}
`;

export const openaiGenerateText = `
use aisdk::{
    core::LanguageModelRequest,
    providers::openai::OpenAI,
};

#[tokio::main]
async fn main() {

    let result = LanguageModelRequest::builder()
        .model(OpenAI::gpt_5())
        .prompt("What is the meaning of life?")
        .build()
        .generate_text() // stream_text() for streaming
        .await
        .unwrap();

    println!("{}", result.text().unwrap());
}
`;

export const anthropicGenerateText = `
use aisdk::{
    core::LanguageModelRequest,
    providers::anthropic::Anthropic,
};

#[tokio::main]
async fn main() {

    let result = LanguageModelRequest::builder()
        .model(Anthropic::claude_opus_4_5())
        .prompt("What is the meaning of life?")
        .build()
        .generate_text() // stream_text() for streaming
        .await
        .unwrap();

    println!("{}", result.text().unwrap());
}
`;

export const openaiStreamText = `
use aisdk::{
    core::{LanguageModelRequest, LanguageModelStreamChunkType},
    providers::openai::OpenAI,
};
use futures::StreamExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    let mut stream = LanguageModelRequest::builder()
        .model(OpenAI::gpt_5())
        .prompt("What is the meaning of life?")
        .build()
        .stream_text()
        .await?;

	while let Some(chunk) = stream.next().await {
		if let LanguageModelStreamChunkType::Text(text) = chunk {
			println!("Streaming text: {}", text);
		}
	}

    Ok(())
}
`;

export const anthropicStreamText = `
use aisdk::{
    core::{LanguageModelRequest, LanguageModelStreamChunkType},
    providers::anthropic::Anthropic,
};
use futures::StreamExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    let mut stream = LanguageModelRequest::builder()
        .model(Anthropic::claude_opus_4_5())
        .prompt("What is the meaning of life?")
        .build()
        .stream_text()
        .await?;

	while let Some(chunk) = stream.next().await {
		if let LanguageModelStreamChunkType::Text(text) = chunk {
			println!("Streaming text: {}", text);
		}
	}

    Ok(())
}
`;

export const googleStreamText = `
use aisdk::{
    core::{LanguageModelRequest, LanguageModelStreamChunkType},
    providers::google::Google,
};
use futures::StreamExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

	let mut stream = LanguageModelRequest::builder()
		.model(Google::gemini_3_flash_preview())
		.prompt("What is the meaning of life?")
		.build()
		.stream_text()
		.await?;

	while let Some(chunk) = stream.next().await {
		if let LanguageModelStreamChunkType::Text(text) = chunk {
			println!("Streaming text: {}", text);
		}
	}

    Ok(())
}
`;
