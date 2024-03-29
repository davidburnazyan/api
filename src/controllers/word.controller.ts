import { Request, Response } from "express";
import {
  JsonController,
  Post,
  HttpCode,
  Get,
  Put,
  Delete,
  Req,
  Res,
  Authorized,
  Params,
} from "routing-controllers";
import { Service } from "typedi";

import { WordService } from "../services/word.service";
import { HttpStatus } from "../enums";

@Service()
@JsonController('/words')
export class WordController {

  constructor(private wordService: WordService) { }


  @Get('/')
  @HttpCode(HttpStatus.OK)
  async read(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const words = await this.wordService.getAll(req)

    res.json(words)
  };

  @Get('/random')
  @HttpCode(HttpStatus.OK)
  async getRandom(
    @Res() res: Response
  ) {
    const response = await this.wordService.getRandom()

    res.json({ data: response })
  };


  @Post('/:id')
  @HttpCode(HttpStatus.OK)
  async create(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const response = await this.wordService.create(req)

    res.json({ response })
  };

  @Post('/set-array')
  @HttpCode(HttpStatus.OK)
  async createByArray(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const response = await this.wordService.createByArray(req)

    res.json({ response })
  };

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Params() params: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    console.log(params);

    const response = await this.wordService.update(params.id, req)

    res.json({ response })
  };

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteById(
    @Params() params: any,
    @Res() res: Response
  ) {
    const response = await this.wordService.deleteById(params.id)

    res.json({ response })
  };

  @Delete('/')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const response = await this.wordService.delete(req)

    res.json({ response })
  };


  @Delete('/all')
  @HttpCode(HttpStatus.OK)
  async deleteAll(
    @Res() res: Response
  ) {
    const response = await this.wordService.deleteAll()

    res.json({ response })
  };
}
