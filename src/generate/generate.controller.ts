import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { GenerateService } from 'src/generate/generate.service';
import { CodingMinigameDto } from 'src/generate/dto/coding-minigame.dto';

@ApiTags('Generate')
@ApiBearerAuth()
@Controller('generate/payload')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('/coding-minigame')
  @ApiBody({
    type: CodingMinigameDto,
    required: true,
    description: 'Clerk id of the user.',
  })
  async generateCodingMinigame(@Body() codingMinigameDto: CodingMinigameDto) {
    return this.generateService.generateCodingMinigame(codingMinigameDto);
  }
}
