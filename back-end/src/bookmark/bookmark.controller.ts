import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkListDto } from './dto/create-list.dto';
import { AddBookmarkItemDto } from './dto/add-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post('create-list')
  createList(@Req() req, @Body() createBookmarkListDto: CreateBookmarkListDto) {
    return this.bookmarkService.createList(req.user.id, createBookmarkListDto);
  }

  @Get('get-lists')
  getLists(@Req() req) {
    return this.bookmarkService.getLists(req.user.id);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('user/@:username')
  getUserLists(@Param('username') username: string, @Req() req) {
    return this.bookmarkService.findPublicListsByUsername(
      username,
      req.user?.id,
    );
  }

  @Get('get-list-details/:id')
  getListDetails(@Req() req, @Param('id') id: string) {
    return this.bookmarkService.getListDetails(req.user.id, id);
  }

  @Post('add-item/:id')
  addItem(
    @Req() req,
    @Param('id') listId: string,
    @Body() addBookmarkItemDto: AddBookmarkItemDto,
  ) {
    return this.bookmarkService.addItem(
      req.user.id,
      listId,
      addBookmarkItemDto,
    );
  }

  @Delete('remove-item/:id/:postId')
  removeItem(
    @Req() req,
    @Param('id') listId: string,
    @Param('postId') postId: string,
  ) {
    return this.bookmarkService.removeItem(req.user.id, listId, postId);
  }

  @Post('update-list/:id') // Using Post for patch behavior if preferred, or Patch
  updateList(
    @Req() req,
    @Param('id') listId: string,
    @Body() updateListDto: { name?: string; isPrivate?: boolean },
  ) {
    return this.bookmarkService.updateList(req.user.id, listId, updateListDto);
  }

  @Delete('delete-list/:id')
  deleteList(@Req() req, @Param('id') listId: string) {
    return this.bookmarkService.deleteList(req.user.id, listId);
  }

  @Post('reorder-items/:id')
  reorderItems(
    @Req() req,
    @Param('id') listId: string,
    @Body() body: { postIds: string[] },
  ) {
    return this.bookmarkService.reorderItems(req.user.id, listId, body.postIds);
  }
}
